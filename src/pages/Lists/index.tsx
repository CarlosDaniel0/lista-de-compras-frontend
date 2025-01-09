import styled from 'styled-components'
import TabBar from '../../components/TabBar'
import { useContext, useState } from 'react'
import { DialogContext } from '../../contexts/Dialog'
import { genId, request } from '../../util'
import Loading from '../../components/Loading'
import useEffectOnce from '../../hooks/useEffectOnce'
import ListCard from './components/ListCard'
import { List } from '../../util/types'
import CreateOrUpdatePanel, { FormList } from './components/CreateOrUpdatePanel'
import { store } from '../../redux/store'
import { ButtonAdd } from '../../components/Button'

export const Container = styled.div`
  height: calc(100dvh - 46px);
  overflow: auto;
`

const loadingLists: List[] = Array.from(
  { length: 5 },
  () => ({ date: '', id: '', name: '', user_id: '' } as List)
)

export default function Lists() {
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [lists, setLists] = useState<List[]>([])
  const { user } = store.getState()

  const loadContent = async () => {
    setLists(loadingLists)
    request<{ status: boolean; message: string; data: { lists: List[] } }>(
      '/lists'
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        setLists(res.data.lists)
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLists((prev) => (!prev[0]?.date ? [] : prev)))
  }

  const handleRemove = (id: string) => {
    const onYes = () => {
      setLoading(true)
      request<{ status: boolean; message: string; data: { list: List } }>(
        `/lists/${id}`,
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

  const handleEdit = (list: List) => {
    setLoading(true)
    request<{ status: boolean; message: string; data: { list: List } }>(
      `/lists/${list?.id}`,
      list,
      'PUT'
    )
      .then((res) => {
        if (!res.status) throw new Error(res?.message)
        setLists((prev) => [
          ...prev.map((item) =>
            item?.id === list?.id ? (list as List) : item
          ),
        ])
        return Dialog.info.show({ message: res.message })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const handleCreate = (list: List) => {
    setLoading(true)
    request<{ status: boolean; message: string; data: { list: List } }>(
      '/lists',
      {
        date: new Date().toISOString(),
        user_id: user.id,
        name: list.name,
      },
      'POST'
    )
      .then((res) => {
        if (!res.status) throw new Error(res?.message)
        setLists((prev) => [...prev, res.data.list])
        return Dialog.info.show({ message: res.message })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  useEffectOnce(loadContent, [])

  return (
    <>
      <Loading status={loading} label="Aguarde..." />
      <TabBar label="Minhas Listas" />
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lists.map((list, i) => (
            <ListCard
              key={genId(`list-${i}`)}
              {...{
                list,
                handleEdit,
                handleRemove,
                Dialog,
                loading: !list.date,
              }}
            />
          ))}
        </div>
        <ButtonAdd
          onClick={async () => {
            Dialog.info.show({
              content: <CreateOrUpdatePanel request={handleCreate} />,
              onConfirm: {
                label: 'Continuar',
                onClick: (setShow, form: FormList) => {
                  if (!form.name) return
                  setShow(false)
                  handleCreate({
                    name: form?.name,
                    date: '',
                    id: '',
                    user_id: '',
                  })
                },
              },
            })
          }}
        />
      </Container>
    </>
  )
}

// import styled, { css } from "styled-components"
// import Button from "../../components/Button"
// import Text from "../../components/Input/text/indext"
// import { PiPlus } from "react-icons/pi"
// import { useState } from "react"
// import Modal from "../../components/Modal"
// import Checkbox from "../../components/Input/checkbox"
// import Switch from "../../components/Input/switch"

// const panel = css`
//   width: 38rem;
//   max-width: 95%;
//   height: 30rem;
//   max-height: 95%;
//   background: #fff;
//   border-radius: 0.45em;

//   @media screen and (max-width: 450px) {
//     width: 100%;
//     max-width: 100%;
//     height: 100%;
//     max-height: 100%;
//     border-radius: 0;
//   }
// `

// const Ul = styled.ul`
//   padding-block-start: 0;
//   list-style: none;

//   & li {
//     padding: 0.4em 0.6em;
//     border: 1px solid rgb(217, 217, 217);
//   }

//   & li:not(:last-child) {
//     border-bottom: none;
//   }

//   & li:last-child{
//     border-bottom-left-radius: 0.4em;
//     border-bottom-right-radius: 0.4em;
//   }

//   & li:first-child {
//     border-top-left-radius: 0.4em;
//     border-top-right-radius: 0.4em;
//   }
// `

{
  /* <main style={{ margin: '0 10px' }}>
      <div style={{ marginTop: 10 }}>
        <p style={{ marginTop: 10, fontSize: '1.8em', fontWeight: 600, textAlign: 'center' }}>Preços Atacado</p>
        <Ul>
          <li style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pague 3 Leve 4 </span>
            <span>4</span>
            <span>R$ 5,10</span>
          </li>
          <li>
            <Checkbox label="Testet" />

          </li>
          <li><Switch label="Teste 2" /></li>
          <li>Teste</li>
          <li>Teste</li>
        </Ul>
      </div>
    </main>
    <Button onClick={() => setShow(true)} style={{ position: 'fixed', bottom: 5, right: 5, width: 38, height: 38, border: 'none', borderRadius: '100%', padding: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0cb853', color: '#fff' }}>
      <PiPlus size={24} />
    </Button>
   
    <Modal {...{ show, setShow, customize: { panel } }}>
      <div style={{ margin: '0 8px' }}>
        <p style={{ marginTop: 10, fontSize: '1.8em', fontWeight: 600, textAlign: 'center' }}>Cadastro de Preço</p>
        <div style={{ marginTop: 10 }}>
          <Text label="Descrição" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Text label="Quant. Min." />
          <Text label="Valor" mask="currency" />
        </div>

        <div style={{ marginTop: 10 }}>
          <Button style={{ width: '100%', background: '#34a578', color: '#fff' }}>Adicionar</Button>
        </div>
        <Checkbox label="Teste1" />
      </div>
    </Modal> */
}
