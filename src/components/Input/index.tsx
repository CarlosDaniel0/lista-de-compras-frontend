import { LabelProps } from "./label";
import { Container } from "./styles";
import { useMask } from "../../hooks/useMask";
import { forwardRef } from "react";

export type IconProps = React.ComponentPropsWithoutRef<'span' | 'button'> & { value?: React.ReactNode, type?: 'span' | 'button' }

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  field?: string,
  label?: string | LabelProps,
  container?: React.ComponentPropsWithoutRef<'div'>,
  mask?: 'currency',
  icon?: {
    left?: IconProps,
    right?: IconProps
  }
}

function Icon(props: IconProps) {
  const { type, value, children, ...rest } = props
  if (type === 'button') return <button {...rest}>{value}</button>
  return <span {...rest}>{value ?? children}</span>
}

const Input = forwardRef<HTMLInputElement, Omit<InputProps, 'label' | 'container'>>((props, ref) => {
  const { icon, mask, ...rest } = props
  useMask(mask, `#${rest?.id}`)

  return (<Container>
    {icon?.left && <Icon {...icon?.left} />}
    <input ref={ref} {...rest} />
    {icon?.right && <Icon {...icon?.right} />}
  </Container>
  )
})

export default Input