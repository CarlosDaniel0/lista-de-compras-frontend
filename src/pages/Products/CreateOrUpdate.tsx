import TabBar from '../../components/TabBar'
import Text from '../../components/Input/text/indext'
import { IoCameraSharp } from 'react-icons/io5'
import { BiBarcodeReader } from 'react-icons/bi'
// import Toggle from '../../components/Toggle'
import Button from '../../components/Button'
import { BsBoxes } from 'react-icons/bs'
// import { useState } from 'react'
import { Container } from '../Lists'
import { useNavigate, useParams } from 'react-router-dom'
import Form, { FormContextProps } from '../../contexts/Form'
import { useContext, useState } from 'react'
import { Product, ProductSupermarket, ProductTypes } from '../../util/types'
import Loading from '../../components/Loading'
import { DialogContext } from '../../contexts/Dialog'
import { formatFormNumbers, request, sleep } from '../../util'
import { ParamsContext } from '../../contexts/Params'
import useEffectOnce from '../../hooks/useEffectOnce'

interface CreateOrUpdateCreateOrUpdateProps {
  path: ProductTypes
}

// const ButtonExtra = styled.button`
//   width: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   vertical-align: middle;
//   padding: 0.25em 0.4em;
//   border: none;
//   outline: none;
//   background: transparent;
//   font-size: 1.1em;
//   cursor: pointer;
//   margin-top: 10px;
//   color: #0525b3;
// `

export default function CreateOrUpdate(
  props: CreateOrUpdateCreateOrUpdateProps
) {
  const { path } = props
  const { id, product_id } = useParams()
  const [loading, setLoading] = useState(false)
  const { state, setState } = useContext(ParamsContext)
  const [data, setData] = useState<Partial<Product<typeof path>>>({
    [`${path.replace(/s$/, '')}_id`]: id,
    last_update: new Date()
  })
  const form = { form: data, setForm: setData } as FormContextProps
  const Dialog = useContext(DialogContext)
  const navigate = useNavigate()

  const icons = {
    Barcode: {
      value: <BiBarcodeReader size={24} />,
      style: { cursor: 'pointer' },
      onClick: async () => {
        setState?.({ ...data as object })
        await sleep(250)
        navigate('/barcode')
      },
    },
    Camera: {
      value: <IoCameraSharp size={24} />,
      style: { cursor: 'pointer' },
      onClick: async () => {
        setState?.({ ...data as object })
        await sleep(250)
        navigate('/camera')
      },
    },
  }

  const create = async () => {
    setLoading(true)
    return request<{
      status: boolean
      message: string
      data: { reciept: Product<typeof path>[] }
    }>(`/${path}/${id}/products`, formatFormNumbers(data as ProductSupermarket, ['price']), 'POST')
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

  const update = async  () => {
    setLoading(true)
    return request<{
      status: boolean
      message: string
      data: { reciept: Product<typeof path> }
    }>(`/${path}/${id}/products/${product_id}`, data, 'PUT')
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
    const { barcode, ...rest } = state ?? {}
    if (!barcode) return
    setData({ ...rest, barcode: String(barcode) })
    setState?.({})
  },[state])

  return (
    <Form {...form}>
      <Loading label="Aguarde..." status={loading} />
      <TabBar label={`${product_id ? 'Alterar' : 'Cadastrar'} Produto`} back />
      <Container style={{ margin: '0 8px' }}>
        <div style={{ height: 10 }}></div>
        <Text
          label="Produto"
          field='description'
          autoFocus
          icon={{ right: icons.Camera }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Text
            container={{ style: { flex: '1 0 0' } }}
            id="inpTxtPrice"
            mask="currency"
            label="Valor"
            field="price"
            nextElement="inpTxtUnity"
          />
          <Text
            id="inpTxtUnity"
            container={{ style: { flexBasis: '40%' } }}
            field="unity"
            label="Unidade"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Text
            container={{ style: { flexBasis: '100%' } }}
            label="Categoria"
            field="category"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Text
            container={{ style: { flexBasis: '100%' } }}
            icon={{ right: icons.Barcode }}
            label="Código de Barras"
            field="barcode"
          />
        </div>
        <Button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10,
          }}
        >
          <BsBoxes />
          Preços Atacado
        </Button>

        <div style={{ marginTop: 10 }}>
          <Button
            onClick={product_id ? update : create}
            style={{
              marginTop: 10,
              width: '100%',
              background: product_id ? '#0952d8' : '#168d55',
              color: '#fff',
            }}
          >
            {product_id ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </Container>
    </Form>
  )
}
