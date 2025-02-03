import { forwardRef, useContext, useMemo, useState } from 'react'
import Button, { ButtonNeutral } from '../../components/Button'
import Text from '../../components/Input/text'
import TabBar from '../../components/TabBar'
import {
  Option,
  ProductRecieptImport,
  Reciept,
  ResponseData,
  Supermarket,
} from '../../util/types'
import { useNavigate, useParams } from 'react-router-dom'
import useEffectOnce from '../../hooks/useEffectOnce'
import {
  currency,
  formatFormNumbers,
  getFiles,
  parseNumberToCurrency,
  request,
} from '../../util'
import { DialogContext } from '../../contexts/Dialog'
import Form, { FormContextProps } from '../../contexts/Form'
import Loading from '../../components/Loading'
import Search from '../../components/Input/search'
import { store } from '../../redux/store'
import { format } from 'date-fns'
// import { handleCreateReciept } from './functions'
import {
  BsDot,
  BsFiletypeJson,
  BsFiletypeTxt,
  BsFiletypeXml,
  BsQrCode,
  BsX,
} from 'react-icons/bs'
import { LuScanText } from 'react-icons/lu'
import Menu from '../../components/Dialog/menu'
import { FaBoxesPacking } from 'react-icons/fa6'
import { ParamsContext } from '../../contexts/Params'
import { Virtuoso } from 'react-virtuoso'
import { ListContainer } from '../../components/Containers'
import ListItemProduct from './components/ListItemProduct'

const today = format(new Date(), 'yyyy-MM-dd')

export default function CreateOrUpdate() {
  const { id } = useParams()
  const { user } = store.getState()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductRecieptImport[]>([])
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([])
  const [data, setData] = useState<Partial<Reciept>>({
    user_id: user.id,
    date: today,
  })
  const navigate = useNavigate()
  const Dialog = useContext(DialogContext)
  const { state, setState } = useContext(ParamsContext)
  const isUpdate = useMemo(() => !!data?.id, [data?.id])

  const form = { form: data, setForm: setData } as FormContextProps

  const getReciept = (id: string) => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { reciept: Reciept }
    }>(`/reciepts/${id}`, '', 'GET')
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        const { reciept } = res.data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { products, supermarket, ...rest } = reciept
        setData({
          ...rest,
          total: parseNumberToCurrency(reciept.total),
          discount: parseNumberToCurrency(rest.discount),
        })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const importReciept = async () => {
    const reciept = { ...data, products }
    setLoading(true)
    return request<ResponseData<{ reciept: Reciept }>>(
      '/reciepts/import',
      reciept,
      'POST'
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

  // const create = () => {
  //   setLoading(true)
  //   handleCreateReciept(formatFormNumbers(data, ['discount', 'total']))
  //     .then((res) => {
  //       if (!res.status) throw new Error(res.message)
  //       Dialog.info.show({
  //         message: res.message,
  //         onConfirm: (setShow) => {
  //           navigate(-1)
  //           setShow(false)
  //         },
  //       })
  //     })
  //     .catch((err) => Dialog.info.show({ message: err.message }))
  //     .finally(() => setLoading(false))
  // }

  const update = () => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { reciept: Reciept }
    }>(`/reciepts/${id}`, formatFormNumbers(data, ['discount', 'total']), 'PUT')
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

  const getProducts = async (
    type: 'xml' | 'json' | 'txt' | 'qrcode' | 'ocr',
    files: FileList | null,
    content: string = ''
  ) => {
    if (files && !content && !!files?.[0]) {
      if (['json', 'txt', 'xml'].includes(type))
        content = (await files.item(0)?.text()) ?? ''
    }

    setLoading(true)
    return await request<
      ResponseData<{
        chavenfe?: string
        discount: number
        total: number
        products: ProductRecieptImport[]
      }>
    >(
      `/reciepts/products/capture/${type}`,
      {
        content: type === 'json' ? JSON.parse(content) : content,
      },
      'POST'
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        const { discount, total, products } = res.data
        setProducts(products)
        setData((prev) => ({ ...prev, discount, total }))
      })
      .catch((err) => {
        Dialog.info.show({ message: err instanceof Error ? err.message : '' })
      })
      .finally(() => setLoading(false))
  }

  const handleImportProducts =
    (type: 'ocr' | 'txt' | 'json' | 'xml' | 'qrcode') =>
    (__: React.MouseEvent<HTMLButtonElement>, close: () => void) => {
      close()
      try {
        switch (type) {
          case 'json':
            return getFiles({ accept: 'application/json' }).then((file) =>
              getProducts('json', file)
            )
          case 'ocr':
            setState?.(data as never)
            navigate('/camera')
            break
          case 'qrcode':
            setState?.(data as never)
            navigate('/qrcode')
            break
          case 'txt':
            return getFiles({ accept: 'text/plain' }).then((file) =>
              getProducts('txt', file)
            )
          case 'xml':
            return getFiles({ accept: 'text/xml' }).then((file) =>
              getProducts('xml', file)
            )
        }
      } catch (e) {
        Dialog.info.show({ message: e instanceof Error ? e.message : '' })
      }
    }

  const optionsMenu: Option[] = [
    {
      key: 'qr-code',
      label: (
        <>
          {' '}
          <BsQrCode /> QR Code
        </>
      ),
      onClick: handleImportProducts('qrcode'),
    },
    {
      key: 'xml',
      label: (
        <>
          <BsFiletypeXml /> Arquivo XML
        </>
      ),
      onClick: handleImportProducts('xml'),
    },
    {
      key: 'json',
      label: (
        <>
          <BsFiletypeJson /> Arquivo JSON
        </>
      ),
      onClick: handleImportProducts('json'),
    },
    {
      key: 'txt',
      label: (
        <>
          <BsFiletypeTxt /> Arquivo TXT
        </>
      ),
      onClick: handleImportProducts('txt'),
    },
    {
      key: 'ocr',
      label: (
        <>
          <LuScanText /> OCR (beta)
        </>
      ),
      onClick: handleImportProducts('ocr'),
      disabled: true,
    },
  ]

  useEffectOnce(() => {
    const { _value, ...rest } = state ?? {}
    if (typeof _value !== 'object') return
    setData({ ...rest })
    getProducts('qrcode', null, _value?.qrcode ?? '')
    setState?.({})
  }, [state])

  useEffectOnce(() => {
    if (id) getReciept(id)
    loadSupermarkets()
  }, [])

  return (
    <Form {...form}>
      {show && (
        <Menu
          {...{
            show,
            setShow,
            options: optionsMenu,
            title: 'Opções de Importação',
          }}
        />
      )}
      <Loading status={loading} label="Aguarde..." />
      <TabBar
        label={`${isUpdate ? 'Alterar' : 'Cadastrar'} Comprovante`}
        back
      />
      <main style={{ padding: '30px 8px', height: 'calc(100dvh - 120px)' }}>
        <Text autoFocus label="Nome" field="name" />
        <Search
          id="inpTxtSupermarket"
          field="supermarket_id"
          label="Supermercado"
          options={supermarkets.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
        <Text type="date" field="date" label="Data" />
        {isUpdate ? (
          <></>
        ) : !products.length ? (
          <ButtonNeutral onClick={() => setShow(true)}>
            <FaBoxesPacking />
            Importar Produtos
          </ButtonNeutral>
        ) : (
          <div style={{ height: 'calc(100% - 265px)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '5px 15px',
              }}
            >
              <div>
                <span>{products.length} Produtos</span>
                <BsDot />
                <span>{currency.format(Number(data?.total ?? 0))}</span>
              </div>
              <Button
                onClick={() => { setProducts([]); setData(({ discount, total, ...rest }) => rest)}}
                style={{
                  padding: '0.1em 0.4em',
                  background: '#b81717',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <BsX size={30} /> <span>Cancelar</span>
              </Button>
            </div>
            <Virtuoso
              style={{ height: 'calc(100% - 26px)' }}
              data={products}
              components={{
                List: forwardRef(({ children, context, ...props }, ref) => (
                  <ListContainer ref={ref} {...props}>
                    {children}
                  </ListContainer>
                )),
              }}
              itemContent={(i, product) => (
                <ListItemProduct {...{ product, i }} />
              )}
            />
          </div>
        )}

        <Button
          disabled={!data?.supermarket_id || !products?.length}
          style={{
            marginTop: 15,
            width: '100%',
            background: isUpdate ? '#0952d8' : '#168d55',
            border: 'none',
            color: '#fff',
          }}
          onClick={isUpdate ? update : importReciept}
        >
          {isUpdate ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </main>
    </Form>
  )
}
