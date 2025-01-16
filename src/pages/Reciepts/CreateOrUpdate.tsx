import { useContext, useMemo, useState } from 'react'
import Button from '../../components/Button'
import Text from '../../components/Input/text/indext'
import TabBar from '../../components/TabBar'
import { Reciept, Supermarket } from '../../util/types'
import { useNavigate, useParams } from 'react-router-dom'
import useEffectOnce from '../../hooks/useEffectOnce'
import {
  parseCurrencyToNumber,
  parseNumberToCurrency,
  request,
} from '../../util'
import { DialogContext } from '../../contexts/Dialog'
import Form, { FormContextProps } from '../../contexts/Form'
import Loading from '../../components/Loading'
import Search from '../../components/Input/search'
import { store } from '../../redux/store'
import { format } from 'date-fns'
import { handleCreateReciept } from './functions'

const today = format(new Date(), 'yyyy-MM-dd')

export default function CreateOrUpdate() {
  const { id } = useParams()
  const { user } = store.getState()
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([])
  const [data, setData] = useState<Partial<Reciept>>({
    user_id: user.id,
    date: today,
  })
  const navigate = useNavigate()
  const Dialog = useContext(DialogContext)
  const isUpdate = useMemo(() => !!data?.id, [data?.id])
  const [loading, setLoading] = useState(false)

  const form = { form: data, setForm: setData } as FormContextProps

  const formatForm = <T,>(obj: T): T =>
    Object.fromEntries(
      Object.entries(obj as Record<string, never>).map(([k, v]) =>
        ['discount', 'total'].includes(k)
          ? [k, parseCurrencyToNumber(v)]
          : [k, v]
      )
    ) as T

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

  const create = () => {
    setLoading(true)
    handleCreateReciept(formatForm(data)).then((res) => {
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

  const update = () => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { reciept: Reciept }
    }>(`/reciepts/${id}`, formatForm(data), 'PUT')
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

  useEffectOnce(() => {
    if (id) getReciept(id)
    loadSupermarkets()
  }, [])

  return (
    <Form {...form}>
      <Loading status={loading} label="Aguarde..." />
      <TabBar
        label={`${isUpdate ? 'Alterar' : 'Cadastrar'} Comprovante`}
        back
      />
      <main style={{ padding: '30px 8px', height: 'calc(100dvh - 120px)' }}>
        <Text autoFocus label="Nome" field="name" />
        <Text type="date" field="date" label="Data" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Text mask="currency" container={{ style: { width: '100%' }}} field="discount" label="Desconto" />
          <Text mask="currency" container={{ style: { width: '100%' }}} field="total" label="Total" />
        </div>
        <Search
          field="supermarket_id"
          label="Supermercado"
          options={supermarkets.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
        <Button
          style={{
            marginTop: 15,
            width: '100%',
            background: isUpdate ? '#0952d8' : '#168d55',
            border: 'none',
            color: '#fff',
          }}
          onClick={isUpdate ? update : create}
        >
          {isUpdate ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </main>
    </Form>
  )
}
