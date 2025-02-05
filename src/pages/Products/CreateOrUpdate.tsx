import TabBar from '../../components/TabBar'
import Text from '../../components/Input/text/index'
import { IoCameraSharp } from 'react-icons/io5'
import { BiBarcodeReader } from 'react-icons/bi'
import Button, { ButtonNeutral } from '../../components/Button'
import { BsBoxes } from 'react-icons/bs'
import { Container } from '../Lists'
import { useNavigate, useParams } from 'react-router-dom'
import Form, { FormContextProps } from '../../contexts/Form'
import { useContext, useEffect, useState } from 'react'
import {
  Product,
  ProductList,
  ProductReciept,
  ProductSupermarket,
  ProductTypes,
  Reciept,
  ResponseData,
  Supermarket,
} from '../../util/types'
import Loading from '../../components/Loading'
import { DialogContext } from '../../contexts/Dialog'
import {
  decimalFormatter,
  formatFormNumbers,
  parseCurrencyToNumber,
  parseNumberToCurrency,
  request,
  sleep,
} from '../../util'
import { ParamsContext } from '../../contexts/Params'
import useEffectOnce from '../../hooks/useEffectOnce'
import Search from '../../components/Input/search'
import { handleCreateProduct } from './functions'

interface CreateOrUpdateCreateOrUpdateProps {
  path: ProductTypes
}

export type GeneralProduct = ProductSupermarket & ProductList & ProductReciept

export default function CreateOrUpdate(
  props: CreateOrUpdateCreateOrUpdateProps
) {
  const { path } = props
  const { id, product_id } = useParams()
  const [loading, setLoading] = useState(false)
  const { state, setState } = useContext(ParamsContext)
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([])
  const [products, setProducts] = useState<ProductSupermarket[]>([])
  const [data, setData] = useState<Partial<GeneralProduct>>({
    [`${path.replace(/s$/, '')}_id`]: id,
    last_update: new Date(),
  })
  const form = { form: data, setForm: setData } as FormContextProps
  const Dialog = useContext(DialogContext)
  const navigate = useNavigate()

  const icons = {
    Barcode: (field: string, target: string) => ({
      value: <BiBarcodeReader size={24} />,
      style: { cursor: 'pointer' },
      onClick: async () => {
        setState?.({ ...(data as object), _field: field, _target: target })
        await sleep(150)
        navigate('/barcode')
      },
    }),
    Camera: (field: string, target: string) => ({
      value: <IoCameraSharp size={24} />,
      style: { cursor: 'pointer' },
      onClick: async () => {
        setState?.({ ...(data as object), _field: field, _target: target })
        await sleep(150)
        navigate('/camera')
      },
    }),
  }

  const loadSupermarkets = () => {
    request<{
      status: boolean
      message: string
      data: { supermarkets: Supermarket[] }
    }>('/supermarkets')
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        setSupermarkets(res.data.supermarkets)
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setSupermarkets((prev) => (!prev[0]?.id ? [] : prev)))
  }

  const getProduct = (id: string, product_id: string) => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { product: Product<typeof path> }
    }>(`/${path}/${id}/products/${product_id}`, '', 'GET')
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        if (!res.data.product) return
        const { product } = res.data
        setData({
          ...res.data.product,
          ...(Object.fromEntries(
            ['price', 'quantity', 'total'].map((key) => [
              key,
              parseNumberToCurrency(
                key in product
                  ? product?.[key as keyof Product<ProductTypes>]
                  : 0
              ) as unknown as number,
            ])
          ) as unknown as GeneralProduct),
        })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const create = async () => {
    setLoading(true)
    return handleCreateProduct(
      path,
      id!,
      formatFormNumbers(data as GeneralProduct, ['price', 'quantity', 'total'])
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        Dialog.info.show({
          message: res.message,
          onConfirm: (setShow) => {
            navigate(-1)
            setShow(false)
          },
        })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const update = async () => {
    setLoading(true)
    return request<{
      status: boolean
      message: string
      data: { reciept: Product<typeof path> }
    }>(
      `/${path}/${id}/products/${product_id}`,
      formatFormNumbers(data as GeneralProduct, ['price', 'quantity', 'total']),
      'PUT'
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        Dialog.info.show({
          message: res.message,
          onConfirm: (setShow) => {
            navigate(-1)
            setShow(false)
          },
        })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const loadReciept = async (id: string): Promise<Reciept> =>
    request<{
      status: boolean
      message: string
      data: { reciept: Reciept }
    }>(`/reciepts/${id}`)
      .then((res) => {
        if (!res.status || !res.data.reciept) throw new Error(res.message)
        setData((prev) => ({
          ...prev,
          position: product_id
            ? prev?.position
            : (res.data.reciept.products?.length ?? 0) + 1,
        }))
        return res.data.reciept
      })
      .catch((err) => {
        Dialog.info.show({ message: err.message })
        return err
      })

  const getProductByBarcode = (supermarket_id: string, barcode?: string) =>
    request<ResponseData<{ product: ProductSupermarket }>>(
      `/supermarkets/${supermarket_id}/products/barcode/${barcode ?? ''}`
    )

  const loadProducts = (id: string) =>
    request<{
      status: boolean
      message: string
      data: { products: ProductSupermarket[] }
    }>(`/supermarkets/${id}/products`)
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        if (!res.data.products) return []
        setProducts(res.data.products)
        return res.data.products
      })
      .catch((err) => {
        Dialog.info.show({ message: err.message })
        return [] as ProductSupermarket[]
      })
      .finally(() => setProducts((prev) => (!prev[0]?.id ? [] : prev)))

  useEffect(() => {
    const [q, p] = [data?.quantity, data?.price]
      .filter((item) => item)
      .map((e) => parseCurrencyToNumber(String(e)))
    if (!q || !p) return
    setData((prev) => ({
      ...prev,
      total: parseNumberToCurrency(+(q * p).toFixed(2)) as unknown as number,
    }))
  }, [data?.quantity, data?.price])

  useEffectOnce(() => {
    document.getElementById('inpTxtDescription')?.focus()
    if (id && path === 'lists') loadSupermarkets()
    if (id && product_id) getProduct(id, product_id)
    if (id && path === 'reciepts')
      loadReciept(id).then((reciept) => loadProducts(reciept.supermarket_id))
  }, [])

  useEffectOnce(async () => {
    const { _target, _value, ...rest } = state ?? {}
    if (rest?.product) {
      const { description, category, quantity, unity, supermarket_id, product_id } =
        (rest?.product ?? {}) as never

      document.getElementById('inpTxtQuantity')?.focus()
      setData({ description, category, quantity, unity, supermarket_id, product_id })
      if (supermarket_id) loadProducts(supermarket_id)
      return setState?.({})
    }
    if (!_target || !_value) return
    const element = document.getElementById(String(_target))
    const product = {
      product_id: String(typeof _value === 'object' ? _value?.product_id : ''),
    }
    setData({
      ...rest,
      ...(_value as unknown as Record<string, string>),
    })
    if (rest?.supermarket_id && product?.product_id) {
      const res = await getProductByBarcode(
        rest?.supermarket_id + '',
        product?.product_id
      )
      if (!res.status) {
        Dialog.info.show({ message: res.message })
        return setState?.({})
      }
      const { id } = res.data.product ?? {}
      if (!id)
        return Dialog.info.show({
          message: 'Produto não encontrado na base de dados',
        })
      product.product_id = id
      await loadProducts(rest?.supermarket_id + '')
    }
    setData((prev) => ({ ...prev, ...product }))
    element?.focus()
    setState?.({})
  }, [state])

  useEffectOnce(() => {
    if (data?.supermarket_id && path === 'lists')
      loadProducts(data?.supermarket_id)
  }, [data?.supermarket_id])

  return (
    <Form {...form}>
      <Loading label="Aguarde..." status={loading} />
      <TabBar label={`${product_id ? 'Alterar' : 'Cadastrar'} Produto`} back />
      <Container style={{ margin: '0 8px' }}>
        <div style={{ height: 10 }}></div>
        {path === 'reciepts' ? (
          <Search
            disabled={!products.length}
            field="product_id"
            label="Produto"
            options={products.map((item) => ({
              value: item.id,
              label: item.description,
            }))}
          />
        ) : (
          <Text
            id="inpTxtDescription"
            label="Produto"
            field="description"
            icon={{ right: icons.Camera('description', 'inpTxtDescription') }}
          />
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {['reciepts', 'lists'].includes(path) && (
            <Text
              container={{ style: { flex: '1 0 0' } }}
              id="inpTxtQuantity"
              label="Quantidade"
              field="quantity"
              format={decimalFormatter}
              nextElement={path === 'lists' ? 'inpTxtUnity' : 'inpTxtPrice'}
            />
          )}
          {['supermarkets', 'reciepts'].includes(path) && (
            <Text
              container={{ style: { flex: '1 0 0' } }}
              id="inpTxtPrice"
              mask="currency"
              label="Valor"
              field="price"
              nextElement={
                path === 'supermarkets' ? 'inpTxtUnity' : 'inpTxtTotal'
              }
            />
          )}
          {['lists'].includes(path) && (
            <Text
              id="inpTxtUnity"
              container={{ style: { flexBasis: '40%' } }}
              field="unity"
              label="Unidade"
            />
          )}
        </div>
        {path === 'reciepts' && (
          <Text
            label="Total"
            id="inpTxtTotal"
            container={{ style: { flex: '1 0 0' } }}
            mask="currency"
            field="total"
            nextElement='btnTotal'
          />
        )}
        {path === 'supermarkets' && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <Text
                container={{ style: { flexBasis: '100%' } }}
                label="Categoria"
                field="category"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Text
                id="inpTxtBarcode"
                container={{ style: { flexBasis: '100%' } }}
                icon={{ right: icons.Barcode('barcode', 'inpTxtBarcode') }}
                label="Código de Barras"
                field="barcode"
              />
            </div>
            <ButtonNeutral>
              <BsBoxes />
              Preços Atacado
            </ButtonNeutral>
          </>
        )}
        {path === 'lists' && (
          <>
            <Search
              id="inpTxtSupermarket"
              nextElement='inpTxtProduct'
              field="supermarket_id"
              label="Supermercado"
              disabled={!supermarkets.length}
              options={supermarkets.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />

            <Search
              id="inpTxtProduct"
              field="product_id"
              label="Produto"
              disabled={!data?.supermarket_id || !products.length}
              container={{ style: { flex: '1 0 0' } }}
              options={products.map((item) => ({
                value: item.id,
                label: item.description,
              }))}
              icon={{
                right:
                  !data?.supermarket_id || !products.length
                    ? {
                        value: icons.Barcode('product_id', 'inpTxtProduct')
                          .value,
                      }
                    : icons.Barcode('product_id', 'inpTxtProduct'),
              }}
            />
          </>
        )}
        <div style={{ marginTop: 10 }}>
          <Button
            id="btnTotal"
            onClick={product_id ? update : create}
            style={{
              border: 'none',
              marginTop: 10,
              width: '100%',
              background: product_id ? '#0952d8' : '#168d55',
              color: '#fff',
            }}
          >
            {product_id ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </Container>
    </Form>
  )
}
