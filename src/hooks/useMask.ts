/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'
import { removeMask, setMask  } from 'simple-mask-money'

export type MaskType = 'currency' | 'decimal'

const decimalOptions = {
  allowNegative: false,
  negativeSignAfter: false,
  decimalSeparator: ',',
  fractionDigits: 4,
  thousandsSeparator: '.',
  cursor: 'end',
  fixed: true,
  prefix: '',
  suffix: '',
}

export const useMask = (mask: MaskType | undefined, id: string) => {
  const mutex = useRef(0)
  const formats = {
    currency: {
      add: (id: string) => setMask(id),
      remove: (id: string) => removeMask(id),
    },
    decimal: {
      add: (id: string) => setMask(id, decimalOptions),
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
