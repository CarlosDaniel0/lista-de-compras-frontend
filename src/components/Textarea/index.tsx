import styled from 'styled-components'
import { genId } from '../../util'
import Label, { LabelProps } from '../Input/label'
import { FormContext } from '../../contexts/Form'
import { useContext } from 'react'

interface TextareaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  field?: string,
  label?: string | LabelProps
  container?: React.ComponentPropsWithoutRef<'div'>
}

const Element = styled.textarea`
  padding: 0.4em 0.4em;
  border-radius: 0.4em;
  border: solid 1px var(--input-border);
  background-color: var(--input-bg);
  color: var(--input-color);
  font-size: 1.2em;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export default function Textarea(props: TextareaProps) {
  const { container, label, onClick, field, ...rest } = props
  const { form, setForm } = useContext(FormContext)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const id = rest?.id ?? genId('txt')
  const value = form?.[(field ?? '') as never] ?? ''
  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = evt.currentTarget
    setForm?.((prev: Record<string, never>) => ({ ...prev, [field ?? '']: value }))
  }

  return (
    <Container {...container}>
      <Label {...labelProps} htmlFor={id} />
      <Element onChange={onChange} value={value} {...rest} id={id} onClick={onClick} />
    </Container>
  )
}
