import styled from 'styled-components'
import { Container } from './styles'
import { PiPlus } from 'react-icons/pi'

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  $bg?: string
}

const ContainerAdd = styled.button<{ $bg?: string }>`
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  position: fixed;
  bottom: 10px;
  right: 5px;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 100%;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.25s ease-in;
  background: ${(attr) => attr?.$bg ?? 'var(--bg-button-add)'};
  color: #fff;
  cursor: pointer;

  &:active {
    scale: 0.89;
    transition: scale 0.15s ease-in;
  }
`

export const RoundedButton = styled.button<{ $bg?: string }>`
  padding: 0.3em 0.8em;
  border: 1px solid var(--border-button);
  background: ${attr => attr?.$bg ?? 'var(--bg-button)'};
  color: var(--color-button);
  border-radius: 1em;
  font-size: 1.05em;
  cursor: pointer;
`

export function ButtonAdd(props: ButtonProps) {
  const { $bg, children, ...rest } = props
  return (
    <ContainerAdd $bg={$bg} {...rest}>
      {children ?? <PiPlus size={32} />}
    </ContainerAdd>
  )
}

export const IconButton = styled.button`
  color: #fff;
  outline: none;
  border: none;
  cursor: pointer;
  background: transparent;
  padding: 2px;
`

export default function Button(props: ButtonProps) {
  const { children, $bg, ...rest } = props
  return (
    <Container $bg={$bg} {...rest}>
      {children}
    </Container>
  )
}
