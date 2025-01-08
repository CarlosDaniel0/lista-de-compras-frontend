import { useContext } from "react";
import Input, { InputProps } from "..";
import { genId } from "../../../util";
import Label from "../label";
import { FormContext } from "../../../contexts/Form";

export default function Text(props: InputProps) {
  const { label, container, field, ...rest } = props
  const { form, setForm } = useContext(FormContext)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const onClick = (evt: React.MouseEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    if (rest?.mask === 'currency') return evt.currentTarget.setSelectionRange(value.length, value.length)
    return rest?.onClick?.(evt)
  }
  const id = rest?.id ?? genId('txt')
  const value = form?.[(field ?? '') as never] ?? ''
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    setForm?.((prev: Record<string, never>) => ({ ...prev, [field ?? '']: value }))
  }

  return <div {...container}>
    <Label {...labelProps} htmlFor={id} />
    <Input value={value} onChange={onChange} {...rest} id={id} onClick={onClick} />
  </div>
}