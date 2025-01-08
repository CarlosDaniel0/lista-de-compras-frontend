import { createContext } from "react";
import { SetState } from "../util/types";

export interface FormContextProps<T = unknown> {
  form: T,
  setForm: SetState<T>
}

interface FormProps extends FormContextProps {
  children?: React.ReactNode
}

const defaultProps: FormContextProps = {
  form: {},
  setForm: () => {}
}

export const FormContext = createContext<FormContextProps>(defaultProps)

export default function Form(props: FormProps) {
  const { children, ...rest } = props
  return <FormContext.Provider value={rest}>{children}</FormContext.Provider>
}