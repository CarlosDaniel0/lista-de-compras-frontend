import { useContext, useState } from 'react'
import TabBar from '../../components/TabBar'
import { genId, request } from '../../util'
import { DialogContext } from '../../contexts/Dialog'
import { Supermarket } from '../../util/types'
import Loading from '../../components/Loading'
import useEffectOnce from '../../hooks/useEffectOnce'
import { ButtonAdd, Container } from '../Lists'
import { PiPlus } from 'react-icons/pi'
import ListCard from './components/ListCard'
import { useNavigate } from 'react-router-dom'

const loadingSupermarket: Supermarket[] = Array.from(
  { length: 5 },
  () => ({ address: '', coords: [], id: '', name: '' } as Supermarket)
)

export default function Supermarkets() {
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<Supermarket[]>([])
  const navigate = useNavigate()
  // const { user } = store.getState()

  const loadContent = async () => {
    setLists(loadingSupermarket)
    request<{ status: boolean; message: string; data: { supermarkets: Supermarket[] } }>(
      '/supermarket'
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        setLists(res.data.supermarkets)
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLists((prev) => (!prev[0]?.id ? [] : prev)))
  }

  const handleRemove = (id: string) => {
    const onYes = () => {
      setLoading(true)
      request<{ status: boolean; message: string; data: { supermarket: Supermarket } }>(
        `/supermarket/${id}`,
        {},
        'DELETE'
      )
        .then((res) => {
          if (!res.status) throw new Error(res?.message)
          setLists((prev) => prev.filter((list) => list.id !== id))
          return Dialog.info.show({ message: res.message })
        })
        .catch((err) => Dialog.info.show({ message: err.message }))
        .finally(() => setLoading(false))
    }
    Dialog.option.show({
      message: 'Deseja remover esse Supermercado?',
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
      <TabBar label="Supermercados" />
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map((supermarket, i) => (
            <ListCard
              key={genId(`list-${i}`)}
              {...{
                supermarket,
                handleRemove,
                loading: !supermarket.id,
              }}
            />
          ))}
        </div>
        <ButtonAdd
          onClick={async () => {
            navigate('/supermarkets/create')
          }}
        >
          <PiPlus size={32} />
        </ButtonAdd>
      </Container>
    </>
  )
}
