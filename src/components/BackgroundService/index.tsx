import { useRef, useState } from "react"
import { BiBulb } from "react-icons/bi"
import styled from "styled-components"
import Circle from "../Progress/circle"

const Panel = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
    rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  border-radius: 0.4em;
  padding: 0.2em 0.5em;
  background: var(--bg-card-1);
  color: var(--color-card-1);
  margin: 0 5px;
  transition: all ease-in 0.2s;
  font-size: 1.02em;
  display: flex;
  align-items: center;

  * {
    color: var(--color-card-1);
  }
`
export default function BackgroundService () {
  const worker = new BroadcastChannel('worker')
  const [progress, setProgress] = useState(0)
  const [indicator, setIndicator] = useState(false)
  const timer = useRef<NodeJS.Timeout|null>(null)

  worker.addEventListener('message', (evt) => {
    const { data } = evt
    if (typeof data !== 'object' || !('progress' in data)) return
    const { progress: p, finish } = data
    setProgress(p)
    if (!indicator && !timer.current) timer.current = setTimeout(() => setIndicator(true), 5 * 1000)
    if (finish) setTimeout(() => {
      setIndicator(false)
      setProgress(0)
    }, 1.5 * 1000)
  })

  if (!progress) return null
  return <Panel style={indicator ? { borderRadius: '100%', padding: '0.3em' } : undefined}>
    {indicator 
    ? <>
        <Circle percentual={progress} size={36} strokeWidth={3.2} offset={1} />
        {progress && <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7em' }}>{progress}%</span>}
      </>
    : <>
      <span style={{ marginTop: 2 }}><BiBulb size={22} /></span>
      <span>Sincronização de Base de Dados</span>
    </>}
  </Panel>
}