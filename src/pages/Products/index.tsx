/* eslint-disable @typescript-eslint/no-unused-vars */
import TabBar from '../../components/TabBar'
import { currency, genId, request } from '../../util'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../../components/Loading'
import { forwardRef, useContext, useState } from 'react'
import { ParamsContext } from '../../contexts/Params'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DialogContext } from '../../contexts/Dialog'
import Text from '../../components/Input/text/indext'
import { Product, ProductSupermarket, ResponseData } from '../../util/types'
import { format } from 'date-fns'
import { ButtonAdd } from '../../components/Button'
import { Container } from '../Lists'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import ListCard from './components/ListItem'
import { ListContainer } from '../../components/Containers'

interface ProductsProps {
  path: 'lists' | 'supermarkets' | 'reciepts'
}

const BottomBar = styled.div`
  padding: 0.4em 0.2em;
  justify-content: space-between;
  display: flex;
  background: #ededed;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
`

const ProductPanel = (props: { product: ProductSupermarket }) => {
  const { product } = props
  return (
    <>
      <h3>{product?.description}</h3>
      <p
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#4a4a4a',
          fontSize: '1.4em',
        }}
      >
        <span>{product?.barcode}</span>{' '}
        <Text
          style={{
            fontSize: '0.85em',
            maxWidth: 90,
            padding: '0.2em 0.4em',
          }}
          defaultValue={product?.price ?? ''}
          mask="currency"
        />
      </p>
      <p className="d-flex gap-2">
        <span>Última Atualização</span>
        <b>{format(new Date(product?.last_update), 'dd/MM/yyyy')}</b>
      </p>
    </>
  )
}

const productLoading = {
  category: '',
  description: '',
  id: '',
  index: 0,
  last_update: new Date(),
  list_id: '',
  price: '',
  product_id: '',
  quantity: 0,
  receipt_id: '',
  supermarket_id: '',
  total: 0,
  unity: '',
}
export default function Products(props: ProductsProps) {
  const { state, setState } = useContext(ParamsContext)
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [show] = useState(false)
  const [products, setProducts] = useState<Product<typeof path>[]>([])
  const navigate = useNavigate()
  const { id } = useParams()
  const { path } = props

  const loadingProducts: Product<typeof path>[] = Array.from(
    { length: 5 },
    () => productLoading
  )

  const loadProducts = () => {
    setProducts(loadingProducts)
    request<ResponseData<{ products: Product<typeof path>[] }>>(
      `/${path}/${id}/products`
    )
      .then((res) => res.status && setProducts(res.data.products))
      .catch((err) => {
        setProducts([])
        console.log(err.message)
      })
      .finally(() => {})
  }

  const handleRemove = () => {}

  const getProductByBarcode = () => {
    const { barcode } = state ?? {}
    if (!barcode) return
    setLoading(true)
    request<ResponseData<{ product: ProductSupermarket }>>(
      `/supermarkets/1/products/${barcode}`
    )
      .then((res) => {
        if (!res.status) return
        if (!res.data?.product)
          return Dialog.option.show({
            onConfirm: {
              label: 'Adicionar',
              onClick: () => {
                navigate('/register')
              },
            },
            onCancel: {
              color: '#a11515',
              label: 'Cancelar',
            },
            message: res.message,
          })
        const { product } = res.data
        Dialog.option.show({
          onConfirm: () => {},
          onCancel: () => {},
          content: <ProductPanel product={product} />,
        })
      })
      .catch((err) => console.log(err.message))
      .finally(() => {
        setLoading(false)
        setState?.({})
      })
  }

  useEffectOnce(loadProducts, [])
  useEffectOnce(getProductByBarcode, [state])

  return (
    <>
      <Loading status={loading} label="Aguarde..." />
      <TabBar label={'Produtos'} back />
      <Container $height={show ? 83 : 46}>
        {/* {[
          {
            label: 'Arroz',
            quantity: 2,
            value: currency.format(28.9),
          },
          {
            label: 'Feijão',
            quantity: 1,
            value: currency.format(28.9),
          },
          {
            label: 'Leite',
            quantity: 12,
            value: currency.format(28.9),
          },
        ].map((item, i) => (
          <Card key={`item-${i}}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RxDragHandleDots2 size={18} color="#4d4d4d" />
                <Checkbox label={item.label} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span>{item.quantity}</span>
                <b>{item.value}</b>
              </div>
            </div>
          </Card>
        ))} */}
        <Virtuoso
          style={{ height: '100%' }}
          data={products}
          components={{
            List: forwardRef(({ children, context, ...props }, ref) => (
              <ListContainer ref={ref} {...props}>
                {children}
              </ListContainer>
            )),
          }}
          itemContent={(i, product) => (
            <ListCard
              key={genId(`product-${path}-${i}`)}
              {...{
                product,
                id,
                path,
                handleRemove,
                loading: !product.id,
              }}
            />
          )}
        />
      </Container>
      {show && (
        <BottomBar>
          <span style={{ fontSize: '1.1em' }}>Total</span>
          <span style={{ fontSize: '1.1em' }}>{currency.format(552)}</span>
        </BottomBar>
      )}
      <ButtonAdd
        style={show ? { bottom: 32 } : undefined}
        onClick={() => navigate(`/${path}/${id}/create`)}
      />
    </>
  )
}
