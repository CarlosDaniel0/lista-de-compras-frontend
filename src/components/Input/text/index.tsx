import { useContext, useRef } from 'react'
import Input, { InputProps } from '..'
import { genId } from '../../../util'
import Label from '../label'
import { FormContext } from '../../../contexts/Form'
import useEffectOnce from '../../../hooks/useEffectOnce'

const maskOptions = ['currency', 'decimal']
export default function Text(props: InputProps) {
  const { label, container, field, nextElement, format: formatter, ...rest } = props
  const { form, setForm } = useContext(FormContext)
  const input = useRef<HTMLInputElement>(null)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const onClick = (evt: React.MouseEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    if (maskOptions.includes(rest?.mask ?? ''))
      return evt.currentTarget.setSelectionRange(value.length, value.length)
    return rest?.onClick?.(evt)
  }

  const format = (value: string) => {
    if (/(\d{4})-(\d{2})-(\d{2})/.test(value)) return value.substring(0, 10)
    return value
  }

  const id = rest?.id ?? genId('txt')
  const value = format(form?.[(field ?? '') as never] ?? '')

  const setValue = (value: string) => {
    setForm?.((prev: Record<string, never>) => ({
      ...prev,
      [field ?? '']: formatter ? formatter(value) : value,
    }))
  }

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target
    setValue(value)
  }

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (props?.onKeyDown || !props?.mask || !nextElement || !['Tab'].includes(evt.key)) return 
    document.getElementById(nextElement)?.focus()
  }

  const handleValue = () => {
    if (!input.current) return
    setValue(input.current.value)
  }

  useEffectOnce(() => {
    if (!input.current || !rest?.mask) return
    input.current!.addEventListener('input', handleValue)
    return () => {
      input.current!.removeEventListener('input', handleValue)
    }
  }, [])

  return (
    <div {...container}>
      <Label {...labelProps} htmlFor={id} />
      <Input
        ref={input}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...rest}
        id={id}
        onClick={onClick}
      />
    </div>
  )
}
