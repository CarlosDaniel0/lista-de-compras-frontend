import { createPortal } from 'react-dom'
import Info from './info'
import Option from './option'
import { ReactElement, useContext } from 'react'
import {  DialogInternalContext } from '../../contexts/Dialog'

export default function Dialog() {
  const { show, setShow, props, type, form, setForm } = useContext(DialogInternalContext)
  const container = document.getElementById('modal-portal')
  let Element: ReactElement = <></>
  const { onConfirm, onCancel } = props ?? {}
  const p = { props, show, setShow, form, setForm, onConfirm, onCancel,  }
  switch (type) {
    case 'info': Element = <Info {...p} />; break;
    case 'option': Element = <Option {...p} />; break;
  }

  return createPortal(Element, container!)
}
