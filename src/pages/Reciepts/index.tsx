import { useContext, useState } from 'react'
import Loading from '../../components/Loading'
import TabBar from '../../components/TabBar'
import { Container } from '../Lists'
import { useNavigate } from 'react-router-dom'
import { genId, request } from '../../util'
import { Reciept } from '../../util/types'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DialogContext } from '../../contexts/Dialog'
import { ButtonAdd } from '../../components/Button'
import ListCard from './components/ListItem'

const loadingReciepts = Array.from(
  { length: 5 },
  () =>
    ({
      date: '',
      discount: 0,
      id: '',
      name: '',
      supermarket_id: '',
      total: 0,
      user_id: '',
    } as Reciept)
)
export default function Reciepts() {
  const [reciepts, setReciepts] = useState<Reciept[]>([])
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadContent = async () => {
    setReciepts(loadingReciepts)
    request<{
      status: boolean
      message: string
      data: { reciepts: Reciept[] }
    }>('/reciepts')
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        setReciepts(res.data.reciepts)
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setReciepts((prev) => (!prev[0]?.id ? [] : prev)))
  }

  const handleRemove = (id: string) => {
    const onYes = () => {
      setLoading(true)
      request<{
        status: boolean
        message: string
        data: { reciept: Reciept }
      }>(`/reciepts/${id}`, {}, 'DELETE')
        .then((res) => {
          if (!res.status) throw new Error(res?.message)
          setReciepts((prev) => prev.filter((reciept) => reciept.id !== id))
          return Dialog.info.show({ message: res.message })
        })
        .catch((err) => Dialog.info.show({ message: err.message }))
        .finally(() => setLoading(false))
    }
    Dialog.option.show({
      message: 'Deseja remover esse comprovante?',
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

  useEffectOnce(loadContent, [])

  return (
    <>
      <Loading status={loading} label="Aguarde..." />
      <TabBar label="Comprovantes" />
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reciepts.map((reciept, i) => (
            <ListCard
              key={genId(`reciept-${i}`)}
              {...{
                reciept,
                handleRemove,
                loading: !reciept.id,
              }}
            />
          ))}
        </div>
        <ButtonAdd
          onClick={async () => {
            navigate('/reciepts/create')
          }}
        />
      </Container>
    </>
  )
}
