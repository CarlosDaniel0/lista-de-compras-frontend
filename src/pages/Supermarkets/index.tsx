import { useContext, useState } from 'react'
import TabBar from '../../components/TabBar'
import { genId, request } from '../../util'
import { DialogContext } from '../../contexts/Dialog'
// import { store } from '../../redux/store'
import { Supermarket } from '../../util/types'
import Loading from '../../components/Loading'
import useEffectOnce from '../../hooks/useEffectOnce'
import { ButtonAdd, Container } from '../Lists'
import { PiPlus } from 'react-icons/pi'
import ListCard from './components/ListCard'

const loadingSupermarket: Supermarket[] = Array.from(
  { length: 5 },
  () => ({ address: '', coords: [], id: '', name: '' } as Supermarket)
)

export default function Supermarkets() {
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<Supermarket[]>([])
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
      message: 'Deseja remover essa lista?',
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

  const handleEdit = (supermarket: Supermarket) => {
    setLoading(true)
    request<{ status: boolean; message: string; data: { supermarket: Supermarket } }>(
      `/supermarket/${supermarket?.id}`,
      supermarket,
      'PUT'
    )
      .then((res) => {
        if (!res.status) throw new Error(res?.message)
        setLists((prev) => [
          ...prev.map((item) =>
            item?.id === supermarket?.id ? (supermarket as Supermarket) : item
          ),
        ])
        return Dialog.info.show({ message: res.message })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  // const handleCreate = (supermarket: Supermarket) => {
  //   setLoading(true)
  //   request<{ status: boolean; message: string; data: { supermarket: Supermarket } }>(
  //     '/list',
  //     {
  //       date: new Date().toISOString(),
  //       user_id: user.id,
  //       name: supermarket.name,
  //     },
  //     'POST'
  //   )
  //     .then((res) => {
  //       if (!res.status) throw new Error(res?.message)
  //       setLists((prev) => [...prev, res.data.list])
  //       return Dialog.info.show({ message: res.message })
  //     })
  //     .catch((err) => Dialog.info.show({ message: err.message }))
  //     .finally(() => setLoading(false))
  // }

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
                handleEdit,
                handleRemove,
                Dialog,
                loading: !supermarket.id,
              }}
            />
          ))}
        </div>
        <ButtonAdd
          onClick={async () => {
            // Dialog.info.show({
            //   content: <CreateOrUpdatePanel request={handleCreate} />,
            //   onConfirm: {
            //     label: 'Continuar',
            //     onClick: (setShow, form: FormList) => {
            //       if (!form.name) return
            //       setShow(false)
            //       handleCreate({
            //         name: form?.name,
            //         date: '',
            //         id: '',
            //         user_id: '',
            //       })
            //     },
            //   },
            // })
          }}
        >
          <PiPlus size={32} />
        </ButtonAdd>
      </Container>
    </>
  )
}
