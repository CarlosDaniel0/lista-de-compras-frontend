import { useContext, useRef, useState } from 'react'
import styled from 'styled-components'
import Input, { InputProps } from '..'
import { FormContext } from '../../../contexts/Form'
import { genId } from '../../../util'
import Label from '../label'
import { FaSearch } from 'react-icons/fa'
import { Virtuoso } from 'react-virtuoso'
import useEffectOnce from '../../../hooks/useEffectOnce'
import { IconButton } from '../../Button'
import { BsX } from 'react-icons/bs'

const Container = styled.div<{ $active?: boolean }>`
  ${(attr) =>
    attr?.$active
      ? `
    position: fixed;
    top: 0px; left: 0px;
    right: 0px; bottom: 0;
    background: var(--bg);
    padding: 10px 5px;`
      : ''}
`

const List = styled.div<{ $active?: boolean }>`
  margin-top: 10px;
  height: calc(100% - 76px);
  display: ${(attr) => (attr?.$active ? 'block' : 'none')};
`

const Item = styled.div<{ $selected?: boolean }>`
  background: ${(attr) =>
    attr?.$selected ? 'var(--bg-search-item)' : 'var(--bg-card-1)'};
  color: var(--color-card-1);
  padding: 0.4em 1.2em;
  border: 1px solid var(--border-button);
  border-radius: 0.4em;
  font-size: 1.2em;
  cursor: pointer;
`

const Row = styled.div`
  width: 100%;

  & .container-image {
    display: flex;
    width: 50%;
    margin: 0 auto;

    & img {
      width: 100%;
    }
  }

  & p {
    font-weight: 500;
    text-align: center;
    font-size: 1.2em;
  }
`

const Empty = (props: { message: string }) => {
  const { message } = props
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100% - 67px)',
      }}
    >
      <Row>
        <div className="container-image">
          <img style={{ objectFit: 'contain' }} src="/img/empty-box.png" />
        </div>
        <p>{message}</p>
      </Row>
    </div>
  )
}

interface OptionSearch {
  label?: string
  value: string | number | boolean
}

export default function Search(
  props: InputProps & { options?: OptionSearch[] }
) {
  const { label, container, field, options, ...rest } = props
  const [active, setActive] = useState(false)
  const { form, setForm } = useContext(FormContext)
  const [object, setObject] = useState({ search: '', label: '' })
  const [index, setIndex] = useState(-1)
  const mutex = useRef(0)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const id = rest?.id ?? genId('txt')
  const value = active ? object?.search : object?.label ?? ''
  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    setObject((prev) => ({ ...prev, search: value }))
  }

  const onBlur = () => {}

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = evt
    if (!['Enter', 'Tab', 'ArrowDown', 'ArrowUp'].includes(key)) return
    switch (key) {
      case 'ArrowDown':
        evt.preventDefault()
        setIndex((prev) => Math.min(++prev, options?.length ?? 0))
        break
      case 'ArrowUp':
        evt.preventDefault()
        setIndex((prev) => Math.max(--prev, -1))
        break
      case 'Enter':
      case 'Tab':
      default:
        evt.preventDefault()
        if (options?.[index]) handleSelect(options?.[index])
    }
  }

  const handleSelect = (item: OptionSearch) => {
    setActive(false)
    setObject((prev) => ({ ...prev, label: item.label ?? '' }))
    setForm((prev: Record<string, never>) => ({
      ...prev,
      [field ?? '']: item.value,
    }))
    setIndex(-1)
  }

  useEffectOnce(() => {
    const value = form?.[(field ?? '') as never]
    if (!value || mutex.current) return
    mutex.current = 1
    const item = options?.find((el) => el?.value === value)
    const label = item?.label ?? ''
    const search = item?.label ?? ''
    setObject({ label, search })
  }, [form?.[(field ?? '') as never]])

  return (
    <Container
      $active={active}
      onClick={() => !active && !rest?.disabled && setActive(true)}
      {...container}
    >
      <Label {...labelProps} htmlFor={id} />
      <Input
        id={id}
        onBlur={onBlur}
        icon={{
          right: {
            children: <FaSearch size={20} style={{ margin: '0 4px', filter: rest?.disabled ? 'grayScale(0,6)' : undefined }} />,
          },
        }}
        {...rest}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {active && <IconButton onClick={() => setActive(false)} style={{ position: 'absolute', right: 5, top: 1, color: 'inherit' }}><BsX  size={32} /></IconButton>}
      {!options?.length && active ? (
        <Empty message="Não há itens para serem exibidos" />
      ) : (
        <List $active={active}>
          <Virtuoso
            style={{ height: '100%' }}
            data={options?.filter((item) =>
              `${item?.value} ${item?.label}`
                .toLowerCase()
                .includes(object?.search?.toLowerCase())
            )}
            itemContent={(i, option) => (
              <Item
                $selected={index === i}
                onClick={() => handleSelect(option)}
                key={genId(`item-search-${i}-`)}
              >
                <span>{option.label ?? ''}</span>
              </Item>
            )}
          />
        </List>
      )}
    </Container>
  )
}
