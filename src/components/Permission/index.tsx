/* eslint-disable react-hooks/exhaustive-deps */
import styled from "styled-components"
import TabBar from "../TabBar"
import { IoCameraSharp } from "react-icons/io5"
import Card from "../Card"

interface RequestPermissionProps<T> {
  icon?: JSX.Element,
  title?: string,
  message?: string,
  requestPermission: () => Promise<null | T>
}

const Button = styled.button`
  cursor: pointer;
  color: #fff;
  background: #1346b4;
  font-size: 1.2em;
  padding: 0.3em 1.6em;
  border-radius: 0.8em;
  outline: none;
  border: none;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

  &:hover,
  &:active {
    background: #4275e2;
  }
`

const Container = styled.div`
  height: calc(100% - 36px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export default function RequestPermission <T,>(props: RequestPermissionProps<T>) {
  const { icon, title, message, requestPermission } = props
  return (
    <>
      <TabBar label="Verificar Permissão" back />
      <Container>
        <Card
          style={{
            margin: '0 15px',
            padding: '1.2em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            maxWidth: 300,
            transform: 'translateY(-20%)',
          }}
        >
          {icon ?? <IoCameraSharp size="6em" style={{ color: '#4470c6' }} />}
          <h2>{title ?? 'Permissão de Câmera'}</h2>
          <p
            style={{ fontSize: '1.1em', color: 'var(--color-subtitle-permission)', textAlign: 'center' }}
          >
            {message ?? 'Por favor, permita o acesso a camera para utilizar o leitor de Códigos de Barras'}
          </p>
          <Button onClick={() => requestPermission()}>Permitir</Button>
        </Card>
      </Container>
    </>
  )
}
