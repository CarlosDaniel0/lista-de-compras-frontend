/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from 'styled-components'
import TabBar from '../../components/TabBar'
import { forwardRef, useContext, useMemo, useState } from 'react'
import { DialogContext } from '../../contexts/Dialog'
import {
  formatToFilter,
  genId,
  getFiles,
  JSONToFile,
  request,
} from '../../util'
import Loading from '../../components/Loading'
import useEffectOnce from '../../hooks/useEffectOnce'
import ListCard from './components/ListCard'
import { List, Option } from '../../util/types'
import CreateOrUpdatePanel, { FormList } from './components/CreateOrUpdatePanel'
import { store } from '../../redux/store'
import { ButtonAdd } from '../../components/Button'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import { Virtuoso } from 'react-virtuoso'
import { ListContainer } from '../../components/Containers'
import SearchBar from '../../components/SearchBar'
import { format } from 'date-fns'

export const Container = styled.div<{ $height?: number }>`
  height: ${(attr) => `calc(100dvh - ${attr?.$height ?? 46}px)`};
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
  const [filter, setFilter] = useState({ show: false, search: '' })
  const { user } = store.getState()

  const loadContent = async () => {
    setLists(loadingLists)
    const params = new URLSearchParams()
    params.append('u', user?.id ?? '')
    request<{ status: boolean; message: string; data: { lists: List[] } }>(
      '/lists?' + params
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

  const handleCreate = (list: List | List[]) => {
    setLoading(true)
    request<{ status: boolean; message: string; data: { list: List[] } }>(
      '/lists',
      !Array.isArray(list)
        ? {
            date: new Date().toISOString(),
            user_id: user.id,
            name: list.name,
          }
        : list,
      'POST'
    )
      .then((res) => {
        if (!res.status) throw new Error(res?.message)
        setLists((prev) => [...prev, ...res.data.list])
        return Dialog.info.show({ message: res.message })
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const handleImport = () => {
    getFiles({
      accept: 'application/json',
    }).then(async (data) => {
      if (!data) return
      const file = await data.item(0)?.text()
      try {
        const json = JSON.parse(file!)
        setLoading(true)
        handleCreate(json)
      } catch (e) {
        Dialog.info.show({ message: e instanceof Error ? e.message : '' })
      }
    })
  }

  const handleExport = () => JSONToFile(lists, 'Listas')

  const formatString = (item: List) =>
    formatToFilter(`${item?.name} ${format(new Date(item.date), 'dd/MM/yyyy')}`)

  const data = useMemo(
    () =>
      lists.filter(
        (item) =>
          !filter.search ||
          formatString(item).includes(formatToFilter(filter.search))
      ),
    [lists, filter]
  )

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

  useEffectOnce(loadContent, [])

  return (
    <>
      <Loading status={loading} label="Aguarde..." />
      <TabBar label="Minhas Listas" options={options} />
      <Container>
        {!!lists.length && !!lists?.[0]?.id && (
          <SearchBar {...{ filter, setFilter }} />
        )}
        <Virtuoso
          style={{ height: 'calc(100% - 45px)' }}
          data={data}
          components={{
            List: forwardRef(({ ...props }, ref) => (
              <ListContainer ref={ref} {...props} />
            )),
          }}
          itemContent={(i, list) => (
            <ListCard
              key={genId(`list-${i}`)}
              {...{
                list,
                index: i,
                lists: data,
                handleEdit,
                handleRemove,
                Dialog,
                loading: !list.date,
              }}
            />
          )}
        />
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
// import Text from "../../components/Input/text/index"
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
