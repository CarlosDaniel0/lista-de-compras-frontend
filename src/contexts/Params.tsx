import { createContext, useState } from 'react'
import { SetState } from '../util/types'

type G = { [key: string]: string | number | undefined | boolean | null | { [x: string]: string; } }
export interface StateParams<T = G> {
  state?: T
  setState?: SetState<T>
}

export const ParamsContext = createContext<StateParams>({})

export default function ParamsProvider(props: { children?: React.ReactNode }) {
  const [state, setState] = useState<G>({})

  return (
    <ParamsContext.Provider value={{ state, setState }}>
      {props?.children}
    </ParamsContext.Provider>
  )
}
