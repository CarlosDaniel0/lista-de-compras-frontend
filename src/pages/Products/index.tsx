import { RxDragHandleDots2 } from 'react-icons/rx'
import Card from '../../components/Card'
import TabBar from '../../components/TabBar'
import Checkbox from '../../components/Input/checkbox'
import { currency, request } from '../../util'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import Loading from '../../components/Loading'
import { useContext, useState } from 'react'
import { ParamsContext } from '../../contexts/Params'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DialogContext } from '../../contexts/Dialog'
import Text from '../../components/Input/text/indext'

const ButtonAdd = styled(Link)`
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: fixed;
  bottom: 10px;
  right: 5px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 100%;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0cb853;
  color: #fff;
`

interface Product {
  name?: string
  last_update?: Date | null
  code?: number
  short_name?: string | null
  unit?: string
  barcode?: string | null
  price?: string
  category?: string | null
  supermarket_id?: number
}

export default function Products(props: { name: string }) {
  const { name } = props
  const { state, setState } = useContext(ParamsContext)
  const Dialog = useContext(DialogContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffectOnce(() => {
    const { barcode } = state ?? {}
    if (!barcode) return
    setLoading(true)
    request<{ status: boolean; message: string; data: { product: Product } }>(
      `/supermarket/1/product/${barcode}`
    )
      .then((res) => {
        if (!res.status) return
        if (!res.data?.product)
          return Dialog.option.show({
            onConfirm: {
              label: 'Adicionar',
              onClick: () => {
                navigate('/register')
              },
            },
            onCancel: {
              color: '#a11515',
              label: 'Cancelar',
            },
            message: res.message,
          })
        const { product } = res.data
        Dialog.option.show({
          onConfirm: () => {},
          onCancel: () => {},
          content: (
            <>
              <h3>{product?.name}</h3>
              <p
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#4a4a4a',
                  fontSize: '1.4em',
                }}
              >
                <span>{product?.barcode}</span>{' '}
                <Text
                  style={{
                    fontSize: '0.85em',
                    maxWidth: 90,
                    padding: '0.2em 0.4em',
                  }}
                  defaultValue={product?.price ?? ''}
                  mask="currency"
                />
              </p>
            </>
          ),
        })
      })
      .catch((err) => console.log(err.message))
      .finally(() => {
        setLoading(false)
        setState?.({})
      })
  }, [state])

  return (
    <>
      <Loading status={loading} label="Aguarde..." />
      <TabBar label={name} back />
      <main>
        {[
          {
            label: 'Arroz',
            quantity: 2,
            value: currency.format(28.9),
          },
          {
            label: 'Feijão',
            quantity: 1,
            value: currency.format(28.9),
          },
          {
            label: 'Leite',
            quantity: 12,
            value: currency.format(28.9),
          },
        ].map((item, i) => (
          <Card key={`item-${i}}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RxDragHandleDots2 size={18} color="#4d4d4d" />
                <Checkbox label={item.label} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span>{item.quantity}</span>
                <b>{item.value}</b>
              </div>
            </div>
          </Card>
        ))}
      </main>
      <div
        style={{
          padding: '0.4em 0.2em',
          justifyContent: 'space-between',
          display: 'flex',
          background: '#ededed',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <span style={{ fontSize: '1.1em' }}>Total</span>
        <span style={{ fontSize: '1.1em' }}>{currency.format(552)}</span>
      </div>
      <ButtonAdd to="/barcode"></ButtonAdd>
    </>
  )
}
