import Input, { InputProps } from "..";
import { genId } from "../../../util";
import Label from "../label";

export default function Text(props: InputProps) {
  const { label, container, ...rest } = props
  const labelProps = typeof label === 'string' ? { value: label } : label
  const onClick = (evt: React.MouseEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    if (rest?.mask === 'currency') return evt.currentTarget.setSelectionRange(value.length, value.length)
    return rest?.onClick?.(evt)
  }
  const id = rest?.id ?? genId('txt')

  return <div {...container}>
    <Label {...labelProps} htmlFor={id} />
    <Input {...rest} id={id} onClick={onClick} />
  </div>
}