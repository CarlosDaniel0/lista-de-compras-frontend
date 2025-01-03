import { InputProps } from "..";
import { genId } from "../../../util";
import Label from "../label";
import { CheckboxContainer } from "../styles";

export default function Checkbox(props: InputProps) {
  const { label, container, ...rest } = props
  const labelProps = typeof label === 'string' ? { value: label } : label
  const onClick = (evt: React.MouseEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    if (rest?.mask === 'currency') return evt.currentTarget.setSelectionRange(value.length, value.length)
    return rest?.onClick?.(evt)
  }
  const id = rest?.id ?? genId('chk')

  return <div {...container} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <CheckboxContainer {...rest} id={id} onClick={onClick} />
    <Label {...labelProps} htmlFor={id} />
  </div>
}


