import { SetState } from '../../util/types'
import { useEffect, useState } from 'react'
import { BsX } from 'react-icons/bs'
import { FaCartShopping, FaClipboardList, FaReceipt } from 'react-icons/fa6'
import { Link, useNavigate } from 'react-router-dom'
import { store } from '../../redux/store'
import { googleLogout } from '@react-oauth/google'
import { changeTheme, signOut } from '../../redux/slices/config'
import { useDispatch } from 'react-redux'
import { RoundedButton } from '../Button'
import {
  Backdrop,
  ButtonClose,
  ContainerMenu,
  IconProfile,
  ItemMenu,
  ListMenu,
  BottomContainerMenu,
  Profile,
} from './styles'
import { genId, setTheme } from '../../util'
import Switch from '../Input/switch'
import Form, { FormContextProps } from '../../contexts/Form'

interface MenuProps {
  show: boolean
  setShow: SetState<boolean>
}

const routes = {
  '/': (
    <>
      <FaClipboardList /> <span>Minhas Listas</span>
    </>
  ),
  '/supermarkets': (
    <>
      <FaCartShopping /> <span>Supermercados</span>
    </>
  ),
  '/reciepts': (
    <>
      <FaReceipt /> <span>Comprovantes</span>
    </>
  ),
  // "/map": <><FaMapMarkerAlt /> <span>Mapa</span></>
}

function Menu(props: MenuProps) {
  const { setShow, show } = props
  const { user } = store.getState()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme } = store.getState()
  const [form, setForm] = useState({ dark: theme === 'dark' })

  const obj = { form, setForm } as FormContextProps

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  }, [show])

  const close = () => setShow(false)
  const handleExit = () => {
    googleLogout()
    dispatch(signOut())
    navigate('/')
    const theme = document.querySelector('meta[name="theme-color"]')
    if (theme) theme.setAttribute('content', '#ffffff')
  }

  const handleChangeTheme = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.target
    setForm(prev => ({ ...prev, dark: checked }))
    const theme = checked ? 'dark' : 'light'
    dispatch(changeTheme(theme))
    setTheme(theme)
  }

  return (
    <>
      {show && <Backdrop onClick={() => setShow(false)} />}
      <ContainerMenu $show={show}>
        <ButtonClose onClick={() => setShow(false)}>
          <BsX size={42} />
        </ButtonClose>
        <ListMenu>
          {Object.entries(routes).map(([route, label], i) => (
            <ItemMenu key={genId(`menu-item-${i}-`)}>
              <Link to={route} onClick={close}>
                {label}
              </Link>
            </ItemMenu>
          ))}
        </ListMenu>

        <BottomContainerMenu>
          <div style={{ margin: '10px 15px' }}>
            <Form {...obj}>
              <Switch onChange={handleChangeTheme} size={2} field="dark" label="Modo Escuro" />
            </Form>
          </div>
          <Profile>
            <div className="profile-row">
              <IconProfile>
                <img src={user.picture} alt={user?.name} />
              </IconProfile>
              <span style={{ fontWeight: 500 }}>{user?.name}</span>
            </div>
            <RoundedButton style={{ marginRight: 10 }} onClick={handleExit}>
              Sair
            </RoundedButton>
          </Profile>
        </BottomContainerMenu>
      </ContainerMenu>
    </>
  )
}

export default Menu
