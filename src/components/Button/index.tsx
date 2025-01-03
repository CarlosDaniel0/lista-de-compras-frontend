import { Container } from "./styles";

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> { }

export default function Button(props: ButtonProps) {
  const { children, ...rest } = props
  return <Container {...rest}>{children}</Container>
}