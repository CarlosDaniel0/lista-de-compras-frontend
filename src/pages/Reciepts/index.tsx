/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef, useContext, useState } from 'react'
import Loading from '../../components/Loading'
import TabBar from '../../components/TabBar'
import { Container } from '../Lists'
import { useNavigate } from 'react-router-dom'
import {
  formatToFilter,
  genId,
  JSONToFile,
  getFiles,
  request,
} from '../../util'
import { Option, Reciept } from '../../util/types'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DialogContext } from '../../contexts/Dialog'
import { ButtonAdd } from '../../components/Button'
import ListCard from './components/ListItem'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import { ListContainer } from '../../components/Containers'
import { Virtuoso } from 'react-virtuoso'
import { handleCreateReciept } from './functions'
import SearchBar from '../../components/SearchBar'
import { format } from 'date-fns'
import { store } from '../../redux/store'
import {
  BsFiletypeJson,
  BsFiletypeTxt,
  BsFiletypeXml,
  BsQrCode,
} from 'react-icons/bs'
import { LuScanText } from 'react-icons/lu'
import Menu from '../../components/Dialog/menu'

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
  const [show, setShow] = useState(false)
  const [filter, setFilter] = useState({ show: false, search: '' })
  const navigate = useNavigate()
  const { user } = store.getState()

  const loadContent = async () => {
    setReciepts(loadingReciepts)
    const params = new URLSearchParams()
    params.append('u', user?.id ?? '')
    request<{
      status: boolean
      message: string
      data: { reciepts: Reciept[] }
    }>('/reciepts?' + params)
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

  const handleImport =
    (type: 'ocr' | 'txt' | 'json' | 'xml' | 'qrcode') =>
    (__: React.MouseEvent<HTMLButtonElement>, close: () => void) => {
      close()
      switch (type) {
        case 'json':
          return getFiles({
            accept: 'application/json',
          }).then(async (data) => {
            if (!data) return
            const file = await data.item(0)?.text()
            try {
              const json = JSON.parse(file!)
              setLoading(true)
              handleCreateReciept(json)
                .then((res) => {
                  if (res.status)
                    setReciepts((prev) => [...prev, ...res.data.reciept])
                  Dialog.info.show({ message: res.message })
                })
                .finally(() => setLoading(false))
            } catch (e) {
              Dialog.info.show({ message: e instanceof Error ? e.message : '' })
            }
          })
        case 'ocr': break
        case 'qrcode': break
        case 'txt': break
        case 'xml': break
      }
    }

  const handleExport = () => JSONToFile(reciepts, 'Comprovantes')

  const formatString = (item: Reciept) =>
    formatToFilter(`${item?.name} ${format(new Date(item.date), 'dd/MM/yyyy')}`)

  const options: Option[] = [
    {
      key: 'import',
      label: (
        <>
          <FaDownload /> Importar
        </>
      ),
      onClick: () => setShow(true),
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

  const optionsMenu: Option[] = [
    {
      key: 'qr-code',
      label: (
        <>
          {' '}
          <BsQrCode /> QR Code
        </>
      ),
      onClick: handleImport('qrcode'),
    },
    {
      key: 'xml',
      label: (
        <>
          <BsFiletypeXml /> Arquivo XML
        </>
      ),
      onClick: handleImport('xml'),
    },
    {
      key: 'json',
      label: (
        <>
          <BsFiletypeJson /> Arquivo JSON
        </>
      ),
      onClick: handleImport('json'),
    },
    {
      key: 'txt',
      label: (
        <>
          <BsFiletypeTxt /> Arquivo TXT
        </>
      ),
      onClick: handleImport('txt'),
    },
    {
      key: 'ocr',
      label: (
        <>
          <LuScanText /> OCR (beta)
        </>
      ),
      onClick: handleImport('ocr'),
      disabled: true,
    },
  ]

  useEffectOnce(loadContent, [])

  return (
    <>
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
      <TabBar label="Comprovantes" options={options} />
      <Container>
        {!!reciepts.length && !!reciepts?.[0]?.id && (
          <SearchBar {...{ filter, setFilter }} />
        )}
        <Virtuoso
          style={{ height: 'calc(100% - 45px)' }}
          data={reciepts.filter(
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
          itemContent={(i, reciept) => (
            <ListCard
              key={genId(`reciept-${i}`)}
              {...{
                reciept,
                handleRemove,
                loading: !reciept.id,
              }}
            />
          )}
        />
        <ButtonAdd
          onClick={async () => {
            navigate('/reciepts/create')
          }}
        />
      </Container>
    </>
  )
}
