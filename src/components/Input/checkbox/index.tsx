import { useContext } from 'react'
import { InputProps } from '..'
import { genId } from '../../../util'
import Label from '../label'
import { CheckboxContainer } from '../styles'
import { FormContext } from '../../../contexts/Form'

export default function Checkbox(props: InputProps) {
  const { label, container, field, ...rest } = props
  const labelProps = typeof label === 'string' ? { value: label } : label
  const { form, setForm } = useContext(FormContext)
  const id = rest?.id ?? genId('chk')
  const checked = form?.[(field ?? '') as never] ?? false

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.currentTarget
    setForm?.((prev: Record<string, never>) => ({
      ...prev,
      [field ?? '']: checked,
    }))
  }

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = evt
    switch (key) {
      case 'Enter':
        setForm?.((prev: Record<string, never>) => ({
          ...prev,
          [field ?? '']: !checked,
        }))
    }
  }

  return (
    <div
      {...container}
      style={{ display: 'flex', gap: 6, alignItems: 'center' }}
    >
      <CheckboxContainer onChange={onChange} onKeyDown={onKeyDown} {...rest} id={id}/>
      <Label {...labelProps} htmlFor={id} />
    </div>
  )
}
