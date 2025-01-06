import styled from 'styled-components'
import { SetState } from '../../util/types'
import { useEffect } from 'react'
import { BsX } from 'react-icons/bs'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { FaCartShopping, FaClipboardList, FaReceipt } from 'react-icons/fa6'
import { Link, useNavigate } from 'react-router-dom'
import { store } from '../../redux/store'
import { googleLogout } from '@react-oauth/google'
import { signOut } from '../../redux/slices/config'
import { useDispatch } from 'react-redux'

interface MenuProps {
  show: boolean
  setShow: SetState<boolean>
}

const Container = styled.div<{ $show?: boolean }>`
  position: fixed;
  bottom: 0;
  z-index: 3;
  max-width: 100%;
  visibility: ${(attr) => (attr?.$show ? 'visible' : 'hidden')};
  background-color: var(--bg-menu);
  color: var(--color-menu);
  background-clip: padding-box;
  outline: 0;
  transition: transform 0.3s ease-in-out;

  top: 0;
  left: 0;
  width: 350px;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  transform: ${(attr) =>
    attr?.$show ? 'translateX(0px)' : 'translateX(-100%)'};
`

const Backdrop = styled.div`
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`

const ButtonClose = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  position: absolute;
  top: 5px;
  right: 5px;
  color: var(--color-menu);
`

const List = styled.ul`
  margin-top: 48px;
  padding-block-start: 0;
  list-style: none;
`

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.8em 1.2em;

  & a {
    color: inherit;
    text-decoration: none;
  }

  & a,
  & span {
    font-size: 1.18em;
  }
`

function Menu(props: MenuProps) {
  const { setShow, show } = props
  const { user } = store.getState()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  }, [show])

  const close = () => setShow(false)

  return (
    <>
      {show && <Backdrop onClick={() => setShow(false)} />}
      <Container $show={show}>
        <ButtonClose onClick={() => setShow(false)}>
          <BsX size={42} />
        </ButtonClose>
        <List>
          <Item>
            <Link to="/" onClick={close}>
              <FaClipboardList /> <span>Minhas Listas</span>
            </Link>
          </Item>
          <Item>
            <Link to="/supermarkets" onClick={close}>
              <FaCartShopping /> <span>Supermercados</span>
            </Link>
          </Item>
          <Item>
            <Link to="/reciepts" onClick={close}>
              <FaReceipt /> <span>Comprovantes</span>
            </Link>
          </Item>
          <Item>
            <Link to="/map" onClick={close}>
              <FaMapMarkerAlt /> <span>Mapa</span>
            </Link>
          </Item>
        </List>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bottom: 5,
            position: 'absolute',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 9,
              alignItems: 'center',
              marginLeft: 10
            }}
          >
            <div style={{ width: 75, height: 75, position: 'relative' }}>
              <img
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  borderRadius: '100%',
                }}
                src={user.picture}
                alt={user?.name}
              />
            </div>
            <span style={{ fontWeight: 500 }}>{user?.name}</span>
          </div>
          <button onClick={() => {
            googleLogout()
            dispatch(signOut())
            navigate('/')
          }} style={{ padding: '0.4em 0.8em', marginRight: 10, border: '1px solid rgb(217, 217, 217)', background: 'transparent', borderRadius: '1.1em', fontSize: '1.05em', cursor: 'pointer' }}>Sair</button>
        </div>
      </Container>
    </>
  )
}

export default Menu
