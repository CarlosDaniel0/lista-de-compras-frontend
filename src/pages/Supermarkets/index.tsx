/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, useContext, useState } from 'react'
import TabBar from '../../components/TabBar'
import { formatToFilter, genId, getFiles, JSONToFile, request } from '../../util'
import { DialogContext } from '../../contexts/Dialog'
import { Option, Supermarket } from '../../util/types'
import Loading from '../../components/Loading'
import useEffectOnce from '../../hooks/useEffectOnce'
import { Container } from '../Lists'
import ListCard from './components/ListCard'
import { useNavigate } from 'react-router-dom'
import { ButtonAdd } from '../../components/Button'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import { Virtuoso } from 'react-virtuoso'
import { ListContainer } from '../../components/Containers'
import { handleCreateSupermarket } from './functions'
import SearchBar from '../../components/SearchBar'

const loadingSupermarkets: Supermarket[] = Array.from(
  { length: 5 },
  () => ({ address: '', coords: [], id: '', name: '' } as Supermarket)
)

export default function Supermarkets() {
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([])
  const [filter, setFilter] = useState({ show: false, search: '' })
  const navigate = useNavigate()

  const loadContent = async () => {
    setSupermarkets(loadingSupermarkets)
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

  const handleRemove = (id: string) => {
    const onYes = () => {
      setLoading(true)
      request<{
        status: boolean
        message: string
        data: { supermarket: Supermarket }
      }>(`/supermarkets/${id}`, {}, 'DELETE')
        .then((res) => {
          if (!res.status) throw new Error(res?.message)
          setSupermarkets((prev) => prev.filter((list) => list.id !== id))
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

  const handleImport = () => {
    getFiles({
      accept: 'application/json',
    }).then(async (data) => {
      if (!data) return
      const file = await data.item(0)?.text()
      try {
        const json = JSON.parse(file!)
        setLoading(true)
        handleCreateSupermarket(json)
          .then((res) => {
              setSupermarkets((prev) => [...prev, ...res.data.supermarket])
            Dialog.info.show({ message: res.message })
          })
          .finally(() => setLoading(false))
      } catch (e) {
        Dialog.info.show({ message: e instanceof Error ? e.message : '' })
      }
    })
  }

  const handleExport = () => JSONToFile(supermarkets, 'Supermercados')

  const formatString = (item: Supermarket) => formatToFilter(`${item?.name} ${item?.address} ${item?.coords.join(', ')}`)

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
      <TabBar label="Supermercados" options={options} />
      <Container>
        {!!supermarkets.length && !!supermarkets?.[0]?.id && <SearchBar {...{ filter, setFilter }} />}
        <Virtuoso
          style={{ height: 'calc(100% - 45px)' }}
          data={supermarkets.filter(item => !filter.search || formatString(item).includes(formatToFilter(filter.search)))}
          components={{
            List: forwardRef(({ children, context, ...props }, ref) => (
              <ListContainer ref={ref} {...props}>
                {children}
              </ListContainer>
            )),
          }}
          itemContent={(i, supermarket) => (
            <ListCard
              key={genId(`supermarket-${i}`)}
              {...{
                supermarket,
                handleRemove,
                loading: !supermarket.id,
              }}
            />
          )}
        />
        <ButtonAdd
          onClick={async () => {
            navigate('/supermarkets/create')
          }}
        />
      </Container>
    </>
  )
}
