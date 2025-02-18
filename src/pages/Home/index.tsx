import { FaClipboardList, FaGithub } from 'react-icons/fa6'
import styled from 'styled-components'
import Card from '../../components/Card'
import { Link, useNavigate } from 'react-router-dom'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { request, databaseSync } from '../../util'
import { useContext, useState } from 'react'
import { Loader } from '../../components/Loading'
import { User } from '../../util/types'
import { useDispatch } from 'react-redux'
import { signIn } from '../../redux/slices/config'
import useEffectOnce from '../../hooks/useEffectOnce'
import { store } from '../../redux/store'
import { DialogContext } from '../../contexts/Dialog'
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread'

const Container = styled.main`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

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
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const Dialog = useContext(DialogContext)
  const { token, user, settings } = store.getState()

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    setLoading(true)
    request<{ status: boolean; message: string; data: { user: User } }>(
      '/auth',
      credentialResponse,
      'POST'
    )
      .then((res) => {
        if (!res.status) throw new Error(res.message)
          const { user } = res.data
        setTimeout(() => databaseSync(settings.localPersistence, user.id), 250)
        dispatch(signIn(res.data.user))
        setTimeout(() => {
          const theme = document.querySelector('meta[name="theme-color"]')
          if (theme) theme.setAttribute('content', '#272727')
          navigate('/lists')
          history.replaceState({}, '', '/lists')
        }, 50)
      })
      .catch((err) => {
        console.log(err.message)
      })
      .finally(() => setLoading(false))
  }

  const handleError = () => {
    Dialog.info.show({ message: 'Falha ao efetuar o login' })
  }

  useEffectOnce(() => {
    
    const worker = new Worker(
      new URL('../../lib/database/sqlite.ts', import.meta.url),
      { type: 'module' }
    )
    initBackend(worker)
    if (token && !user?.id)
      handleSuccess({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        select_by: 'btn',
        credential: token,
      })
  }, [])

  return (
    <Container>
      {!loading ? (
        <Card style={{ padding: '0.8em 1.4em', margin: '0 15px' }}>
          <section>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span>
                <FaClipboardList size={43} />
              </span>
            </div>
            <h2 style={{ textAlign: 'center' }}>Lista de Compras</h2>
            <p>
              Faça suas listas de compras e acompanhe o valor gasto em um só
              lugar
            </p>
          </section>
          <Row>
            <GoogleLogin
              text="signin_with"
              shape="circle"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Row>
        </Card>
      ) : (
        <>
          <Loader />
          <span style={{ fontSize: '1.2em', marginTop: 10 }}>Entrando...</span>
        </>
      )}
      <Github to="https://github.com/carlosdaniel0">
        <FaGithub size={24} />{' '}
        <span style={{ fontSize: '1.1em' }}>Carlos Daniel</span>
      </Github>
    </Container>
  )
}
