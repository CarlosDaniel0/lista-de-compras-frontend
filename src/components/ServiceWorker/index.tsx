import { FaX } from 'react-icons/fa6'
import styled from 'styled-components'
import { useRegisterSW } from 'virtual:pwa-register/react'
import useEffectOnce from '../../hooks/useEffectOnce'
import { DEBUG } from '../../util/constants'

const Panel = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  border-radius: 0.4em;
  padding: 0.4em 0.5em;
  background: var(--bg-card-1);
  margin: 0 15px;
`

const Button = styled.button`
  background: transparent;
  outline: none;
  border: none;
  padding: 0.2em 0.3em;
  cursor: pointer;
`

const ButtonRefresh = styled.button`
  outline: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
`

export default function ServiceWorker() {
  // replaced dyanmicaly
  const reloadSW = '__RELOAD_SW__'

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (DEBUG) console.log(`Service Worker at: ${swUrl}`)
      // @ts-expect-error just ignore
      if (reloadSW === 'true') {
        r &&
          setInterval(() => {
            console.log('Checking for sw update')
            r.update()
          }, 20000 /* 20s for testing purposes */)
      } else {
        // eslint-disable-next-line prefer-template
        if (DEBUG) console.log('SW Registered: ' + r?.scope)
      }
    },
    onRegisterError(error) {
      if (DEBUG) console.log('SW registration error', error)
    },
  })
  
  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  const refresh = () => {
    setNeedRefresh(false)
    updateServiceWorker(true)
  }

  useEffectOnce(() => {
    setTimeout(() => setOfflineReady(false), 15 * 1000)
  }, [])

  // Substituir por componente de Snackbar futuramente
  if (offlineReady)
    return (
      <Panel>
        App disponível Offline
        <Button onClick={close}><FaX /></Button>
      </Panel>
    )
  if (needRefresh)
    return (
      <Panel>
        Nova atualização: <ButtonRefresh onClick={refresh}>Atualizar Agora?</ButtonRefresh>
        <Button onClick={close}>
          <FaX />
        </Button>
      </Panel>
    )
  return null
}
