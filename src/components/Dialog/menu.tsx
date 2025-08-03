import { genId } from '../../util'
import { Option, SetState } from '../../util/types'
import Card from '../Card'
import Modal from '../Modal'
import { css } from 'styled-components'

interface MenuProps {
  show: boolean
  setShow: SetState<boolean>
  title?: string
  options: Option[]
}

const styles = css`
  transform: translateY(-100px);
  border-radius: 0.4em;
  max-height: 90dvh;
  max-height: 90vh;

  & li:first-child > button {
    border-radius: 0.4em 0.4em 0 0;
  }

  & li:last-child > button {
    border-radius: 0 0 0.4em 0.4em;
  }

  & p {
    text-align: center;
    font-size: 1.35em;
    font-weight: 500;
    padding: 0.4em 1.2em;
  }

  & ul {
    list-style: none;
  }

  & button {
    width: 100%;
    padding: 0.6em 1.4em;
    width: 100%;
    font-size: 1.35em;
    color: var(--color-inactive);
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;

    & svg {
      margin-right: 10px;
    }

    &:not(:disabled):hover {
      color: var(--color-active);
      background: var(--hover-button);
    }

    &:disabled {
      cursor: auto;
    }
  }
`

const stylePanel = css`
  max-height: 80%;
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`

export default function Menu(props: MenuProps) {
  const { show, setShow, options, title } = props
  const close = () => setShow(false)
  if (!show) return null
  return (
    <Modal {...{ show, setShow, customize: { panel: stylePanel } }}>
      <Card css={styles} style={{ padding: 0 }}>
        {title && <p>{title}</p>}
        <ul>
          {options.map((option, i) => (
            <li key={genId(`${option?.key}-${i}-`)}>
              <button
                disabled={option?.disabled}
                onClick={(evt) => {
                  if (option.onClick) option.onClick?.(evt, close)
                  close()
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </Modal>
  )
}
