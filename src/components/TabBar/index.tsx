import { useMemo, useRef, useState } from 'react'
import { RxChevronLeft, RxHamburgerMenu } from 'react-icons/rx'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Menu from '../Menu'
import { Option } from '../../util/types'
import { IconButton } from '../Button'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { genId } from '../../util'

interface ITabBarProps {
  children?: React.ReactNode
  label?: string
  back?: boolean
  options?: Option[]
}

const Container = styled.div`
  display: flex;
  align-items: center;
  background: #272727;
  padding: 0.25em 0.4em;
  justify-content: space-between;

  & span {
    color: #fff;
  }
`

const Title = styled.div`
  overflow: hidden;
  max-width: 80%;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: break-word;
  color: #fff;
`

const PanelOptions = styled.div<{ $top: number; $right: number }>`
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  position: fixed;
  top: ${(attr) => attr?.$top}px;
  right: ${(attr) => attr?.$right}px;
  background: var(--bg-card-1);
  color: var(--color-card-1);
  border-radius: 0.4em;
  padding: 0.4em 0.6em;
  transition: all 0.35s cubic-bezier(0.075, 0.82, 0.165, 1);

  & ul {
    list-style: none;
    padding-inline-start: 0px;
  }
`

const ButtonOption = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  width: 100%;
  padding: 0.2em 0.6em;
  background: transparent;
  font-size: 1.1em;
  color: inherit;
  display: flex;
  gap: 15px;
  justify-content: space-between;
`

export default function TabBar(props: ITabBarProps) {
  const { label, back, options } = props
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const [panel, setPanel] = useState({ show: false })

  const position = useMemo(() => {
    if (!button.current) return { top: 50, right: 10 }
    const { bottom, right } = button.current.getBoundingClientRect()
    return { top: bottom + 5, right }
  }, [button])

  const showOptions = () => setPanel((prev) => ({ ...prev, show: !prev.show }))
  const closeOptions = () => {
    setTimeout(() => setPanel({ show: false }), 250)
  }

  return (
    <>
      <Menu {...{ show, setShow }} />
      <Container>
        <IconButton onClick={() => (back ? navigate(-1) : setShow(true))}>
          {back ? (
            <RxChevronLeft color="#fff" size={30} />
          ) : (
            <RxHamburgerMenu color="#fff" size={30} />
          )}
        </IconButton>
        <Title>{label}</Title>
        {Array.isArray(options) && options.length ? (
          <IconButton ref={button} onClick={showOptions} onBlur={closeOptions}>
            <BsThreeDotsVertical size={24} />
          </IconButton>
        ) : (
          <div style={{ width: 28 }} />
        )}
        {panel.show && (
          <PanelOptions $right={position.right} $top={position.top}>
            <ul style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              {Array.isArray(options) &&
                options.map((option, i) => (
                  <li key={genId(`option-li-${i}-`)}>
                    <ButtonOption onClick={evt => {
                      option?.onClick?.(evt, closeOptions)
                      closeOptions()
                    }}>
                      {option.label}
                    </ButtonOption>
                  </li>
                ))}
            </ul>
          </PanelOptions>
        )}
      </Container>
    </>
  )
}
