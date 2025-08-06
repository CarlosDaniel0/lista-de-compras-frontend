import { useContext } from 'react'
import { InputProps } from '..'
import { FormContext } from '../../../contexts/Form'
import { genId } from '../../../util'
import Label from '../label'
import { CheckboxSwitch } from '../styles'

export default function Switch(props: InputProps) {
  const { label, container, field, size, ...rest } = props
  const { form, setForm } = useContext(FormContext)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const id = rest?.id ?? genId('swc')
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
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        ...(container?.style ?? {}),
      }}
    >
      <CheckboxSwitch
        $size={size as 1 | 2}
        checked={checked}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...rest}
        id={id}
      />
      <Label {...labelProps} htmlFor={id} />
    </div>
  )
}
