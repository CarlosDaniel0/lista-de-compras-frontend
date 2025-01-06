import { FaClipboardList, FaGithub } from 'react-icons/fa6'
import styled from 'styled-components'
import Card from '../../components/Card'
import { Link } from 'react-router-dom'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

const Container = styled.main`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

// const Button = styled.button<{ $bg?: string }>`
//   padding: 0.4em 0.8em;
//   width: 100%;
//   font-size: 1.1em;
//   background: ${(attr) => attr?.$bg};
//   color: ${(attr) => attr?.color ?? '#1a1a1a'};
//   border-radius: 0.4em;
//   outline: none;
//   border: none;
//   cursor: pointer;
// `

const Row = styled.section`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  @media screen and (min-width: 540px) {
    & {
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: center;
    }
  }
`

const Github = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
  color: inherit;
  text-decoration: none;
`

export default function Home() {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse)
  }

  const handleError = () => {
    console.log('Login Failed')
  }

  return (
    <Container>
      <Card style={{ padding: '0.8em 1.4em', margin: '0 15px' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span>
              <FaClipboardList size={43} />
            </span>
          </div>
          <h2 style={{ textAlign: 'center' }}>Lista de Compras</h2>
          <p>
            Faça suas listas de compras e acompanhe o valor gasto em um só lugar
          </p>
        </section>
        <Row>
          <GoogleLogin
            text='signin_with'
            shape='circle'
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Row>
      </Card>
      <Github to="https://github.com/carlosdaniel0">
        <FaGithub size={24} />{' '}
        <span style={{ fontSize: '1.1em' }}>Carlos Daniel</span>
      </Github>
    </Container>
  )
}
