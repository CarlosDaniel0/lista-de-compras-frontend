import { BsBoxes } from 'react-icons/bs'
import Button from '../../components/Button'
import Text from '../../components/Input/text/indext'
import { IoCameraSharp } from 'react-icons/io5'
import { BiBarcodeReader, BiChevronDown, BiChevronUp } from 'react-icons/bi'
import { useState } from 'react'
import Toggle from '../../components/Toggle'
import TabBar from '../../components/TabBar'
import styled from 'styled-components'

const ButtonExtra = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  padding: 0.25em 0.4em;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 10px;
  color: #0525b3
`

export default function Register() {
  const [show, setShow] = useState(false)
  return (
    <>
      <TabBar label="Editar" back />
      <main style={{ padding: '0 8px' }}>
        <div style={{ height: 10 }}></div>
        <Text
          label="Produto"
          icon={{ right: { value: <IoCameraSharp size={24} /> } }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Text id="inpTxtQuantity" label="Quantidade" />
          <Text id="inpTxtValue" mask="currency" label="Valor" />
        </div>
        <ButtonExtra
          onClick={() => setShow((prev) => !prev)}
        >
          <span>Informações Extras</span>{' '}
          {show ? <BiChevronUp size={24} /> : <BiChevronDown size={24} />}
        </ButtonExtra>
        <Toggle {...{ show, setShow }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text
              container={{ style: { flexBasis: '70%' } }}
              label="Código de Barras"
              icon={{ right: { value: <BiBarcodeReader size={24} /> } }}
            />
            <Text container={{ style: { flexBasis: '30%' } }} label="Unidade" />
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
        </Toggle>
        <div style={{ marginTop: 10 }}>
          <Button
            style={{
              marginTop: 10,
              width: '100%',
              background: '#0952d8', //'#168d55', Adicionar
              color: '#fff',
            }}
          >
            Atualizar
          </Button>
        </div>
      </main>
    </>
  )
}
