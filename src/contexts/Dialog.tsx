/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState } from 'react'
import { SetState } from '../util/types'

export type ActionDialog = () => void
export interface ButtonDialog
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> {
  label?: string
  onClick?: (
    setShow: SetState<boolean>,
    form: Record<string, unknown>,
    evt: React.MouseEvent<HTMLButtonElement>
  ) => void
}

export interface DialogProps {
  content?: React.ReactNode
  message?: string
  form?: Record<string, unknown>,
  onConfirm?: ButtonDialog | ActionDialog
}

export interface DialogPropsOption extends DialogProps {
  onCancel?: ButtonDialog | ActionDialog
}

type DialogTypes = 'info' | 'option' | ''
interface DialogType<T> {
  show: (props: T) => void
}

export interface DialogService {
  info: DialogType<DialogProps>
  option: DialogType<DialogPropsOption>
}

export interface DialogServiceInternal {
  show: boolean
  type: DialogTypes
  setShow: SetState<boolean>
  form: Record<string, unknown>
  setForm: SetState<Record<string, unknown>>
  props?: DialogPropsOption
}

export interface DialogServiceContent<T>
  extends Omit<DialogServiceInternal, 'form' | 'setForm' | 'type'> {
  form: T
  setForm: SetState<T>
}

const dialogProps = { show: () => {} }
const defaultProps: DialogService = {
  info: dialogProps,
  option: dialogProps,
}

const defaultInternalProps: DialogServiceInternal = {
  setShow: () => false,
  show: false,
  form: {},
  setForm: () => {},
  type: '',
}

export const DialogContext = createContext<DialogService>(defaultProps)
export const DialogInternalContext =
  createContext<DialogServiceInternal>(defaultInternalProps)

export default function DialogProvider(props: { children?: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const [type, setType] = useState<DialogTypes>('')
  const [dialogProps, setDialogProps] = useState<DialogProps>({})
  const [form, setForm] = useState<Record<string, unknown>>({})

  const showFn = (p: DialogProps) => {
    setForm(p?.form ?? {})
    setShow(true)
    setDialogProps(p)
  }

  const changeType = (type: DialogTypes) => ({
    show: (p: DialogProps) => {
      setType(type)
      showFn(p)
    },
  })

  const params = {
    info: changeType('info'),
    option: changeType('option'),
  }

  return (
    <DialogContext.Provider value={params}>
      <DialogInternalContext.Provider
        value={{ show, setShow, form, setForm, type, props: dialogProps }}
      >
        {props?.children}
      </DialogInternalContext.Provider>
    </DialogContext.Provider>
  )
}
