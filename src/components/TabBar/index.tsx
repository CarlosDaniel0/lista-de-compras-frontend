import { useState } from 'react'
import { RxChevronLeft, RxHamburgerMenu } from 'react-icons/rx'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import Menu from '../Menu'

interface ITabBarProps {
  children?: React.ReactNode
  label?: string
  back?: boolean
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

export default function TabBar(props: ITabBarProps) {
  const { label, back } = props
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  return (
    <>
      <Menu {...{ show, setShow }} />
      <Container>
        <button
          onClick={() => (back ? navigate(-1) : setShow(true))}
          style={{
            outline: 'none',
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            padding: 2,
          }}
        >
          {back ? (
            <RxChevronLeft color="#fff" size={30} />
          ) : (
            <RxHamburgerMenu color="#fff" size={30} />
          )}
        </button>
        <span>{label}</span>
        <div style={{ width: 28 }} />
      </Container>
    </>
  )
}
