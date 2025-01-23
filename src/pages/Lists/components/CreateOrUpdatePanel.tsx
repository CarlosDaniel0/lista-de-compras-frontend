import { DialogServiceContent } from "../../../contexts/Dialog"
import Text from "../../../components/Input/text"
import { List } from "../../../util/types"

export interface FormList {
  name?: string
}

export default function CreateOrUpdatePanel (
  props: Partial<DialogServiceContent<FormList>> & {
    request: (list: List) => void
    list?: List
  }
) {
  const { form, setForm, setShow, list, request } = props
  return (
    <>
      <h2 style={{ textAlign: 'center', fontSize: '1.4em' }}>
        {typeof list !== 'undefined' ? 'Alterar' : 'Nova'} Lista de Compras
      </h2>
      <Text
        autoFocus
        label="Nome"
        value={form?.name ?? ''}
        onKeyDown={(evt) => {
          if (!['Enter'].includes(evt.key)) return
          evt.preventDefault()
          if (!form?.name) return
          setShow?.(false)
          request({
            date: '',
            id: '',
            user_id: '',
            ...(list ?? {}),
            name: form?.name,
          })
        }}
        onChange={(evt) => {
          const { value } = evt.target ?? {}
          setForm?.((prev) => ({ ...prev, name: value ?? '' }))
        }}
      />
    </>
  )
}