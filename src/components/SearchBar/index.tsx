import { FaSearch } from 'react-icons/fa'
import Text from '../Input/text'
import { FaX } from 'react-icons/fa6'
import { SetState } from '../../util/types'
import Form, { FormContextProps } from '../../contexts/Form'
import styled from 'styled-components'

export interface Filter {
  show: boolean
  search: string
}

interface SearchBarProps {
  filter: Filter
  setFilter: SetState<Filter>
}

const SearchButton = styled.button`
  margin-top: 2px;
  cursor: pointer;
  outline: none;
  margin-left: 5px;
  border: solid 1px var(--input-border);
  border-radius: 0.4em;
  padding: 0.637em 1.17em;
  background: var(--input-item-bg);
  color: var(--input-item-color);
  display: flex;
  align-items: center;
`

export default function SearchBar(props: SearchBarProps) {
  const { filter: form, setFilter: setForm } = props
  const obj = { form, setForm } as FormContextProps
  const close = () => setForm((prev) => ({ ...prev, show: false }))
  if (!form.show)
    return (
      <SearchButton
        onClick={() => setForm((prev) => ({ ...prev, show: true }))}
      >
        <FaSearch size={20} />
      </SearchButton>
    )
  return (
    <Form {...obj}>
      <div style={{ display: 'flex', width: '100%' }}>
        <Text
          autoFocus
          // onBlur={close}
          field="search"
          icon={{
            left: {
              onClick: close,
              children: <FaSearch style={{ margin: '0 0.6em' }} size={20} />,
            },
            right: form.search.length
              ? {
                  onClick: () => setForm({ search: '', show: false }),
                  children: <FaX style={{ margin: '0 0.6em' }} size={18} />,
                }
              : undefined,
          }}
          style={{ padding: '0.26em 0.4em' }}
          container={{ style: { flex: '1 0 0', margin: '2px 5px 0 5px' } }}
        />
      </div>
    </Form>
  )
}
