import { useContext, useMemo, useState } from 'react'
import Button from '../../components/Button'
import Text from '../../components/Input/text'
import Map from '../../components/Map'
import TabBar from '../../components/TabBar'
import Textarea from '../../components/Textarea'
import { LatLngLiteral } from 'leaflet'
import styled from 'styled-components'
import { Supermarket } from '../../util/types'
import { useNavigate, useParams } from 'react-router-dom'
import useEffectOnce from '../../hooks/useEffectOnce'
import { request } from '../../util'
import { DialogContext } from '../../contexts/Dialog'
import Form, { FormContextProps } from '../../contexts/Form'
import Loading from '../../components/Loading'
import { handleCreateSupermarket } from './functions'

const TileHelp = styled.div`
  background: rgb(0, 0, 0, 0.35);
  backdrop-filter: blur(3px);
  position: absolute;
  top: 0;
  left: 0;
  right: 0%;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 15px;
`

const ContainerMap = styled.div`
  position: relative;
  height: calc(100% - 45px);

  @media screen and (max-width: 410px) {
    height: calc(100% - 65px);
  }
`

export default function CreateOrUpdate() {
  const { id } = useParams()
  const [marker, setMarker] = useState<LatLngLiteral>({ lat: -1, lng: -1 })
  const [show, setShow] = useState(true)
  const [data, setData] = useState<Partial<Supermarket>>({})
  const navigate = useNavigate()
  const Dialog = useContext(DialogContext)
  const isUpdate = useMemo(() => !!data?.id, [data?.id])
  const [loading, setLoading] = useState(false)

  const form = { form: data, setForm: setData } as FormContextProps

  const getSupermarket = (id: string) => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { supermarket: Supermarket }
    }>(`/supermarkets/${id}`, '', 'GET')
      .then((res) => {
        if (!res.status) throw new Error(res.message)
        setData(res.data.supermarket)
        const [lat, lng] = res.data.supermarket.coords
        setMarker({ lat, lng })
        setShow(false)
      })
      .catch((err) => Dialog.info.show({ message: err.message }))
      .finally(() => setLoading(false))
  }

  const create = () => {
    setLoading(true)
    handleCreateSupermarket(data)
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

  const update = () => {
    setLoading(true)
    request<{
      status: boolean
      message: string
      data: { supermerket: Supermarket }
    }>(`/supermarkets/${id}`, data, 'PUT')
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

  useEffectOnce(() => {
    if (id) getSupermarket(id)
  }, [])

  useEffectOnce(() => {
    if (marker.lat !== -1)
      setData((prev) => ({ ...prev, coords: [marker.lat, marker.lng] }))
  }, [marker])

  return (
    <Form {...form}>
      <Loading status={loading} label="Aguarde..." />
      <TabBar
        label={`${isUpdate ? 'Alterar' : 'Cadastrar'} Supermercado`}
        back
      />
      <main style={{ padding: '15px 8px', height: 'calc(100dvh - 80px)' }}>
        <Text autoFocus label="Nome" field="name" />
        <Textarea
          rows={3}
          label="Endereço"
          field="address"
          style={{ resize: 'none' }}
        />
        <div style={{ height: 'calc(100% - 260px', marginTop: 5 }}>
          <label htmlFor="" style={{ fontSize: '1.2em' }}>
            Localização
          </label>
          <ContainerMap>
            {show && (
              <TileHelp onClick={() => setShow(false)}>
                <span
                  style={{ fontSize: '1.5em', fontWeight: 500, color: '#fff' }}
                >
                  Clique no mapa para definir a localização
                </span>
              </TileHelp>
            )}
            <Map {...{ marker, setMarker }} />
            {marker.lat !== -1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 }}>
                <span style={{ margin: 0 }}>lat: <b>{marker.lat}</b></span>
                <span style={{ margin: 0 }}>long: <b>{marker.lng}</b></span>
              </div>
            )}
          </ContainerMap>
        </div>
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
