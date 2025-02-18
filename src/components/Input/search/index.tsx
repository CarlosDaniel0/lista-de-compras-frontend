/* eslint-disable react-hooks/exhaustive-deps */
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import Input, { InputProps } from '..'
import { FormContext } from '../../../contexts/Form'
import { genId } from '../../../util'
import Label from '../label'
import { FaSearch } from 'react-icons/fa'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
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
    padding: 10px 5px;
    z-index: 3;`
      : ''}
`

const ListContainer = styled.div<{ $active?: boolean }>`
  margin-top: 10px;
  height: calc(100% - 76px);
  display: ${(attr) => (attr?.$active ? 'block' : 'none')};
`

const List = styled.div`
  overflow: hidden;
  border-radius: 0.4em;
  border: 1px solid var(--border-button);

  & > *:first-child {
    border-radius: 0.4em 0.4em 0 0;
  }

  & > *:last-child {
    overflow: hidden;
    border-radius: 0 0 0.4em 0.4em;
  }
`

const Item = styled.div<{ $selected?: boolean }>`
  background: ${(attr) =>
    attr?.$selected ? 'var(--bg-search-item)' : 'var(--bg-card-1)'};
  color: var(--color-card-1);
  padding: 0.4em 1.2em;
  border-bottom: 1px solid var(--border-button);
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
  const { label, container, field, options, icon, ...rest } = props
  const [active, setActive] = useState(false)
  const { form, setForm } = useContext(FormContext)
  const [object, setObject] = useState({ search: '', label: '' })
  const [index, setIndex] = useState(-1)
  const labelProps = typeof label === 'string' ? { value: label } : label
  const id = rest?.id ?? genId('txt')
  const value = active ? object?.search : object?.label ?? ''
  const ref = useRef<VirtuosoHandle>(null)
  const listRef = useRef<HTMLElement | Window | null>(null)

  const data = useMemo(
    () =>
      options?.filter((item) =>
        `${item?.value} ${item?.label}`
          .toLowerCase()
          .includes(object?.search?.toLowerCase())
      ),
    [options, object?.search]
  )

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.currentTarget
    setObject((prev) => ({
      ...prev,
      search: value,
      label: !value ? '' : prev.label,
    }))
  }

  const onBlur = () => {}

  const onKeyDown = (evt: Event) => {
    const { key, ctrlKey } = evt as KeyboardEvent
    if (!['Enter', 'Tab', 'ArrowDown', 'ArrowUp'].includes(key)) return
    let _index: null | number = null
    switch (key) {
      case 'ArrowDown':
        evt.preventDefault()
        _index = Math.min(
          ctrlKey ? (data?.length ?? 0) - 1 : index + 1,
          (data?.length ?? 0) - 1
        )
        break
      case 'ArrowUp':
        evt.preventDefault()
        _index = Math.max(ctrlKey ? 0 : index - 1, -1)
        break
      case 'Enter':
      case 'Tab':
      default:
        evt.preventDefault()
        if (data?.[index]) handleSelect(data?.[index])
    }

    if (_index !== null) {
      setIndex(_index)
      ref.current!.scrollIntoView({
        index: _index,
        behavior: 'auto',
      })
    }
  }

  const keyDownCallback = useCallback(onKeyDown, [index, ref])

  const scrollerRef = useCallback(
    (element: HTMLElement | Window | null) => {
      if (element) {
        element.addEventListener('keydown', keyDownCallback)
        listRef.current = element
      } else {
        listRef.current!.removeEventListener('keydown', keyDownCallback)
      }
    },
    [keyDownCallback]
  )

  const handleShow = () => !active && !rest?.disabled && setActive(true)

  const handleSelect = (item: OptionSearch) => {
    setActive(false)
    setObject((prev) => ({ ...prev, label: item.label ?? '' }))
    setForm((prev: Record<string, never>) => ({
      ...prev,
      [field ?? '']: item.value,
    }))
    setIndex(-1)
  }

  useEffect(() => {
    const value = form?.[(field ?? '') as never]
    if (!value) return
    const item = options?.find((el) => el?.value === value)
    const label = item?.label ?? ''
    const search = item?.label ?? ''
    setObject({ label, search })
  }, [options, form?.[(field ?? '') as never]])

  return (
    <Container $active={active} onClick={handleShow} {...container}>
      <Label {...labelProps} htmlFor={id} />
      <Input
        id={id}
        onBlur={onBlur}
        icon={{
          left: icon?.left,
          right: icon?.right ?? {
            children: (
              <FaSearch
                size={20}
                style={{
                  margin: '0 4px',
                  filter: rest?.disabled ? 'grayScale(0,6)' : undefined,
                }}
              />
            ),
          },
        }}
        {...rest}
        value={value}
        onChange={onChange}
        onFocus={handleShow}
        onKeyDown={(evt) => onKeyDown(evt as unknown as KeyboardEvent)}
      />
      {active && (
        <IconButton
          onClick={() => setActive(false)}
          style={{ position: 'absolute', right: 5, top: 1, color: 'inherit' }}
        >
          <BsX size={32} />
        </IconButton>
      )}
      {!options?.length && active ? (
        <Empty message="Não há itens para serem exibidos" />
      ) : (
        <ListContainer $active={active}>
          <Virtuoso
            style={{ height: '100%' }}
            data={data}
            ref={ref}
            scrollerRef={scrollerRef}
            components={{
              List: forwardRef(({ context, ...props }, ref) => <List {...props} ref={ref} />),
            }}
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
        </ListContainer>
      )}
    </Container>
  )
}
