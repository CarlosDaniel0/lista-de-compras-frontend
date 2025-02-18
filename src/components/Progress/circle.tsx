import styled from "styled-components"
type Size = { size: string | number }

interface ICircleProps {
  r?: number,
  offset?: number
  size: number
  strokeWidth?: number
  strokeBackground?: string
  strokeIndicator?: string
  percentual: number
  transition?: string
}

const Container = styled.div<Size>`
  position: relative;
  width: ${attr => attr.size || 150}px;
  height: ${attr => attr.size || 150}px;
  border-radius: 50%;
  z-index: 1;
`

const SVG = styled.svg<Size>`
  position: relative;
  width: ${attr => attr.size || 150}px;
  height: ${attr => attr.size || 150}px;
  z-index: 10;
`

const CircleI = styled.circle<{ offset: number }>`
  width: 100%;
  height: 100%;
  fill: none;
  stroke: ${attr => attr.stroke};
  stroke-width: ${attr => attr.strokeWidth};
  stroke-linecap: round; 
  transform: ${attr => `translate(${attr.offset}px, ${attr.offset}px)`};
`

const CircleII = styled.circle<{ $perimeter: number, percentual: number, offset: number, progress: number }>`
  width: 100%;
  height: 100%;
  fill: none;
  stroke-dasharray: ${attr => attr.$perimeter};
  stroke: ${attr => attr.stroke};
  stroke-width: ${attr => attr.strokeWidth};
  stroke-linecap: round;
  stroke-dashoffset: ${attr => `${attr.progress}px`};
  transform: ${attr => `translate(${attr.offset}px, ${attr.offset}px)`};
`

const Circle = (props: ICircleProps) => {
  const { r: radius, offset, size, strokeWidth, strokeBackground, strokeIndicator, percentual, transition } = props
  const sw = strokeWidth || 10
  const of = offset || Math.ceil(sw / 2)
  const r = radius || Math.ceil((size - sw) / 2)
  const perimeter = (typeof r === 'undefined' || !r) ? 440 : 2 * Math.PI * r

  const s1 = strokeBackground || '#686767'
  const s2 = strokeIndicator || '#1281db'

  return (
    <Container size={size}>
      <SVG size={size}>
        <g transform={`rotate(-85.42 ${r + of} ${r + of})`}>
          <CircleI cx={r} cy={r} r={r} strokeWidth={sw} offset={of} stroke={s1}></CircleI>
          <CircleII style={{ transition }} cx={r} cy={r} r={r} strokeWidth={sw} offset={of} stroke={s2} $perimeter={perimeter} percentual={percentual} progress={perimeter - (perimeter * (percentual / 100))}></CircleII>
        </g>
      </SVG>
    </Container>
  )
}

export default Circle