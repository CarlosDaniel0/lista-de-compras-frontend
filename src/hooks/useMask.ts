/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'
import { removeMask, setMask } from 'simple-mask-money'

export type MaskType = 'currency'

export const useMask = (mask: MaskType | undefined, id: string) => {
  const mutex = useRef(0)
  const formats = {
    currency: {
      add: (id: string) => setMask(id),
      remove: (id: string) => removeMask(id),
    },
  }

  useEffect(() => {
    if (!mask || mutex.current) return
    mutex.current = 1
    formats[mask].add(id)
    setTimeout(() => (mutex.current = 0), 100)
    return () => {
      formats[mask].remove(id)
    }
  }, [])
}
