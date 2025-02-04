/* eslint-disable @typescript-eslint/no-unused-vars */
import TabBar from '../../components/TabBar'
import {
  currency,
  decimalSum,
  formatToFilter,
  genId,
  getFiles,
  JSONToFile,
  // parseNumberToCurrency,
  request,
} from '../../util'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../../components/Loading'
import { forwardRef, useContext, useMemo, useState } from 'react'
import { ParamsContext } from '../../contexts/Params'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DialogContext } from '../../contexts/Dialog'
// import Text from '../../components/Input/text'
import {
  Option,
  Product,
  ProductList,
  ProductReciept,
  ProductSupermarket,
  ResponseData,
} from '../../util/types'
import { format } from 'date-fns'
import { ButtonAdd, IconButton } from '../../components/Button'
import { Container } from '../Lists'
import styled from 'styled-components'
import { Virtuoso } from 'react-virtuoso'
import ListCard from './components/ListItem'
import { ListContainer } from '../../components/Containers'
import ContextMenu from '../../components/ContextMenu'
import { FaCopy, FaDownload, FaPen, FaTrash, FaUpload } from 'react-icons/fa6'
import { BsDot } from 'react-icons/bs'
import SearchBar from '../../components/SearchBar'
import { BiBarcodeReader } from 'react-icons/bi'
import { handleCreateProduct } from './functions'
import { store } from '../../redux/store'

interface ProductsProps {
  path: 'lists' | 'supermarkets' | 'reciepts'
}

const names = {
  lists: 'Lista',
  supermarkets: 'Supermercado',
  reciepts: 'Comprovante',
}

const BottomBar = styled.div`
  padding: 0.4em 0.2em;
  justify-content: space-between;
  display: flex;
  background: var(--bg-bottom-bar);
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
`

// const ProductResultPanel = (props: { product: ProductSupermarket }) => {
//   const { product } = props
//   return (
//     <>
//       <h3>{product?.description}</h3>
//       <p
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           color: 'var(--color-title-card)',
//           fontSize: '1.4em',
//         }}
//       >
//         <span>{product?.barcode}</span>{' '}
//         <Text
//           style={{
//             fontSize: '0.85em',
//             maxWidth: 90,
//             padding: '0.2em 0.4em',
//           }}
//           defaultValue={parseNumberToCurrency(product?.price ?? '')}
//           mask="currency"
//         />
//       </p>
//       <p
//         className="d-flex gap-2"
//         style={{ color: 'var(--color-subtitle-card)' }}
//       >
//         <span>Última Atualização</span>{' '}
//         <b>
//           {product?.last_update &&
//             format(new Date(product?.last_update), 'dd/MM/yyyy')}
//         </b>
//       </p>
//     </>
//   )
// }

type ProductGeneral = ProductSupermarket & ProductList & ProductReciept
const productLoading: ProductGeneral = {
  category: '',
  description: '',
  id: '',
  position: 0,
  last_update: new Date(),
  list_id: '',
  price: 0,
  product_id: '',
  quantity: 0,
  receipt_id: '',
  supermarket_id: '',
  total: 0,
  discount: 0,
  unity: '',
}

export default function Products(props: ProductsProps) {
  const { path } = props
  const { state, setState } = useContext(ParamsContext)
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [menu, setMenu] = useState({ show: false, top: 0, left: 0 })
  const [products, setProducts] = useState<ProductGeneral[]>([])
  const [product, setProduct] = useState<Partial<Product<typeof path>>>({})
  const [filter, setFilter] = useState({ show: false, search: '' })
  const navigate = useNavigate()
  const { settings } = store.getState()
  const { id } = useParams()

  const loadingProducts: ProductGeneral[] = Array.from(
    { length: 5 },
    () => productLoading
  )

  const productsData = useMemo(() => {
    if (!products?.[0]?.id && settings.groupProducts && path === 'lists') {
      return products.reduce((acc, item, __, arr) => {
        const i = acc.findIndex((el) => el.description === item.description)
        if (i !== -1) {
          const prods = arr.filter((p, index) => index !== i && p.description === item.description)

          acc[i] = {
            ...acc[i],
            group: true,
            quantity: prods.reduce(
              (t, p) => decimalSum(t, p.quantity),
              acc[i].quantity
            ),
            total: prods.reduce(
              (t, p) =>
                decimalSum(
                  t,
                  +((p.quantity ?? 0) * Number(p?.product?.price ?? 0)).toFixed(
                    2
                  )
                ),
              Number(acc[i].total ?? 0)
            ),
          }
        } else acc.push(item)
        return acc
      }, [] as ProductGeneral[])
    }

    return products
  }, [products, path, loading])
  const formatString = (item: ProductGeneral) =>
    formatToFilter(`
      ${item?.position ?? ''} ${
      item?.description ?? item?.product?.description
    } ${item?.barcode ?? item?.product?.barcode ?? ''} ${
      item?.last_update ? format(new Date(item?.last_update), 'dd/MM/yyyy') : ''
    } ${item?.category ?? ''}`)

  const formatProducts = (products: ProductGeneral[]) => {
    if (path === 'lists') {
      Array.isArray(products) &&
        setShow(products.some((item) => item?.product?.price))
      return products.map((item) => ({
        ...item,
        total: (
          (item?.quantity ?? 0) * Number(item?.product?.price ?? 0)
        ).toFixed(2),
      }))
    }
    Array.isArray(products) && setShow(products.some((item) => item?.price))
    return products.sort((a, b) =>
      path === 'reciepts'
        ? 0
        : (a?.description || a?.product?.description)?.localeCompare(
            b?.description || b?.product?.description || ''
          ) ?? 0
    )
  }

  const loadProducts = () => {
    setProducts(loadingProducts)
    request<ResponseData<{ products: ProductGeneral[] }>>(
      `/${path}/${id}/products`
    )
      .then(
        (res) =>
          res.status &&
          setProducts(
            Array.isArray(res.data.products)
              ? formatProducts(res.data.products)
              : []
          )
      )
      .catch((err) => {
        setProducts([])
        console.log(err.message)
      })
      .finally(() => {})
  }

  const handleRemove = (product_id: string) => {
    const onYes = () => {
      setLoading(true)
      request<{
        status: boolean
        message: string
        data: { product: Product<typeof path> }
      }>(`/${path}/${id}/products/${product_id}`, {}, 'DELETE')
        .then((res) => {
          if (!res.status) throw new Error(res?.message)
          setProducts((prev) =>
            prev.filter((product) => product.id !== product_id)
          )
          return Dialog.info.show({ message: res.message })
        })
        .catch((err) => Dialog.info.show({ message: err.message }))
        .finally(() => setLoading(false))
    }
    Dialog.option.show({
      message: 'Deseja remover esse Produto?',
      onConfirm: {
        label: 'Sim',
        onClick: (setShow) => {
          setShow(false)
          onYes()
        },
      },
      onCancel: {
        label: 'Não',
      },
    })
  }

  // const getProductByBarcode = () => {
  //   const { _value } = state ?? {}
  //   if (typeof _value !== 'object') return
  //   setLoading(true)
  //   request<ResponseData<{ product: ProductSupermarket }>>(
  //     `/supermarkets/${id}/products/barcode/${_value?.barcode}`
  //   )
  //     .then((res) => {
  //       if (!res.status) return
  //       if (!res.data?.product)
  //         return Dialog.option.show({
  //           onConfirm: {
  //             label: 'Adicionar',
  //             onClick: () => {
  //               navigate('/register')
  //             },
  //           },
  //           onCancel: {
  //             color: '#a11515',
  //             label: 'Cancelar',
  //           },
  //           message: res.message,
  //         })
  //       const { product } = res.data
  //       Dialog.option.show({
  //         onConfirm: (setShow) => { setShow(false) },
  //         onCancel: (setShow) => { setShow(false) },
  //         content: <ProductResultPanel product={product} />,
  //       })
  //     })
  //     .catch((err) => console.log(err.message))
  //     .finally(() => {
  //       setLoading(false)
  //       setState?.({})
  //     })
  // }

  const onContextMenu = (
    evt: React.MouseEvent<HTMLDivElement>,
    product: Product<typeof path>
  ) => {
    evt.preventDefault()
    evt.stopPropagation()
    const { left, top } = { left: evt.pageX, top: evt.pageY }
    setProduct(product)
    setMenu({ show: true, left, top })
  }

  useEffectOnce(loadProducts, [])
  // useEffectOnce(getProductByBarcode, [state])
  const optionsContext: Option[] = [
    ...(path === 'lists' ? [
      {
        key: 'copy',
        label: (
          <>
            <FaCopy /> Copiar
          </>
        ),
        onClick: () => {
          setState?.({ product } as never)
          navigate(`/${path}/${id}/create`)
          setProduct({})
        }
      }
    ] : []),
    {
      onClick: () => {
        product.id && navigate(`/${path}/${id}/update/${product.id}`)
        setProduct({})
      },
      label: (
        <>
          <FaPen size={16} /> <span>Editar</span>
        </>
      ),
      key: 'edit',
    },
    {
      onClick: () => {
        product.id && handleRemove(product.id)
        setProduct({})
      },
      label: (
        <>
          <FaTrash size={16} /> <span>Remover</span>
        </>
      ),
      key: 'remove',
    },
  ]

  const handleImport = () => {
    getFiles({
      accept: 'application/json',
    }).then(async (data) => {
      if (!data) return
      const file = await data.item(0)?.text()
      try {
        const json = JSON.parse(file!)
        setLoading(true)

        handleCreateProduct(path, id!, json)
          .then((res) => {
            if (res.status)
              setProducts((prev) => [
                ...prev,
                ...(res.data.product as ProductGeneral[]),
              ])
            Dialog.info.show({ message: res.message })
          })
          .finally(() => setLoading(false))
      } catch (e) {
        Dialog.info.show({ message: e instanceof Error ? e.message : '' })
      }
    })
  }

  const handleExport = () => JSONToFile(products, `Produtos-${names[path]}`)

  const options: Option[] = [
    {
      key: 'import',
      label: (
        <>
          <FaDownload /> Importar
        </>
      ),
      onClick: handleImport,
    },
    {
      key: 'export',
      label: (
        <>
          <FaUpload /> Exportar
        </>
      ),
      onClick: handleExport,
    },
  ]

  useEffectOnce(() => {
    const { _value } = state ?? {}
    if (typeof _value !== 'object') return
    const element = document.getElementById('inpTxtSearch')
    setFilter({
      show: true,
      search: String(_value?.barcode),
    })
    element?.focus()
    setState?.({})
  }, [state])

  const total = useMemo(
    () =>
      productsData.reduce(
        (tot, item) =>
          decimalSum(
            tot,
            path === 'lists'
              ? Number(item.total ?? 0)
              : decimalSum(
                  +(
                    Number(item?.quantity ?? 0) *
                    (item?.price ?? Number(item?.product?.price ?? 0))
                  ).toFixed(2),
                  -Number(item?.discount ?? 0)
                )
          ),
        0
      ),
    [productsData, path]
  )

  return (
    <>
      {menu.show && (
        <ContextMenu {...{ setMenu, menu, options: optionsContext }} />
      )}
      <Loading status={loading} label="Aguarde..." />
      <TabBar label="Produtos" options={options} back />
      <Container $height={show ? 83 : 46}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {!!products.length && !!products?.[0]?.id && (
            <>
              <SearchBar {...{ filter, setFilter, id: 'inpTxtSearch' }} />
              {!filter.show && ['supermarkets', 'reciepts'].includes(path) && (
                <IconButton
                  onClick={() => navigate('/barcode')}
                  style={{
                    padding: '0.2em 1.17em',
                    color: 'var(--input-item-color)',
                    justifyContent: 'space-between',
                    marginRight: 5,
                  }}
                >
                  <BiBarcodeReader size={32} />
                </IconButton>
              )}
            </>
          )}
        </div>
        <Virtuoso
          style={{ height: 'calc(100% - 45px)' }}
          data={productsData.filter(
            (item) =>
              !filter.search ||
              formatString(item).includes(formatToFilter(filter.search))
          )}
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
                products,
                onContextMenu,
                product,
                id,
                path,
                loading: !product.id,
              }}
            />
          )}
        />
      </Container>
      {show && !loading && (
        <BottomBar>
          <span style={{ fontSize: '1.1em' }}>Total</span>
          <div>
            <span style={{ fontSize: '1.1em' }}>
              {products.length} Produto{products.length > 1 ? 's' : ''}
            </span>
            {path !== 'supermarkets' && (
              <>
                <BsDot />
                <span style={{ fontSize: '1.1em' }}>
                  {currency.format(total)}
                </span>
              </>
            )}
          </div>
        </BottomBar>
      )}
      <ButtonAdd
        style={show ? { bottom: 32 } : undefined}
        onClick={() => navigate(`/${path}/${id}/create`)}
      />
    </>
  )
}
