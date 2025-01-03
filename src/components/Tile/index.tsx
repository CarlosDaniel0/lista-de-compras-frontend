/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react"

interface TileProps extends React.ComponentPropsWithoutRef<'svg'> {
  width: number,
  height: number,
  cropWidth: string | number | { value?: string | number, minHeight?: number },
  cropHeight: string | number | { value?: string | number, minHeight?: number },
  borderRadius?: string | number,
  x?: string | number,
  y?: string | number
}

export default function Tile(props: TileProps) {
  const { width, height, cropHeight, cropWidth, ...rest } = props
  const parseValue = (value: string | number | { value?: string | number, minHeight?: number }, total: number) => {
    const minHeight = typeof value === 'object' ? value?.minHeight ?? 0 : 0
    let v = typeof value == 'object' ? value?.value : value
    if (typeof v === 'string') {
      if (v.includes('%')) v = +((Number(String(v).replace(/[^0-9.]/g, '')) / 100) * total).toFixed(2)
      v = Number(v)
    }
    return Math.max(v ?? 0, minHeight)
  }
  const cWidth = parseValue(cropWidth, width)
  const cHeight = parseValue(cropHeight, height)
  const x = useMemo(() => Math.ceil(width / 2) - Math.ceil((cWidth / 2)), [width, cropWidth])
  const y = useMemo(() => Math.max(Math.ceil(height / 2) - Math.ceil((cHeight / 2)) - 30, 10), [height, cropHeight])

  return <svg viewBox={`0 0 ${width} ${height}`} fillRule="evenodd" {...rest}>
    <path fill="rgb(0,0,0,0.8)" d={`M0 0 h${width} v${height} h-${width}z
    M${x} ${y} h${cWidth} a5,5 0 0 1 5,5 
    v${cHeight} a5,5 0 0 1 -5,5 
    h-${cWidth} a5,5 0 0 1 -5,-5 
    v-${cHeight} a5,5 0 0 1 5,-5z`} />
  </svg>
}