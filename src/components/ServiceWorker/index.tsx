import { FaX } from 'react-icons/fa6'
import styled from 'styled-components'
import { useRegisterSW } from 'virtual:pwa-register/react'

const Panel = styled.div`
  position: absolute;
  left: 10px;
  right: 10px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  border-radius: 0.4em;
  padding: 0.4em 0.5em;
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
      console.log(`Service Worker at: ${swUrl}`)
      // @ts-expect-error just ignore
      if (reloadSW === 'true') {
        r &&
          setInterval(() => {
            console.log('Checking for sw update')
            r.update()
          }, 20000 /* 20s for testing purposes */)
      } else {
        // eslint-disable-next-line prefer-template
        console.log('SW Registered: ' + r)
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })
  
  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  const refresh = () => updateServiceWorker(true)

  if (offlineReady)
    return (
      <Panel>
        <button onClick={close}></button>
        Esse app já está disponível para funcionar offline
      </Panel>
    )
  if (needRefresh)
    return (
      <Panel>
        <button onClick={close}>
          <FaX />
        </button>
        <button onClick={refresh}></button>
      </Panel>
    )
  return null
}
