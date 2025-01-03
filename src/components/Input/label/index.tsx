import styled from "styled-components"

export interface LabelProps extends React.ComponentPropsWithRef<'label'> {
  value?: string,
  style?: React.CSSProperties,
}

const Container = styled.label`
  font-size: 1.2em;
  color: var(--input-color);
`

export default function Label(props: LabelProps) {
  const { value, ...rest } = props
  return (<Container {...rest}>{value}</Container>)
}