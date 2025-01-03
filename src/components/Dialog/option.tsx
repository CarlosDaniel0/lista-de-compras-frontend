import { css } from 'styled-components'
import Modal from '../Modal'
import { Button } from './info'
import { DialogPropsOption, DialogServiceContent } from '../../contexts/Dialog'
import { cloneElement, ReactElement } from 'react'

interface IPanel extends DialogServiceContent<Record<string, unknown>> {
  props?: DialogPropsOption
}

const panel = css`
  width: 38rem;
  max-width: 95%;
  max-height: 95%;
  color:  var(--color-card-1);
  background: var(--bg-card-1);
  border-radius: 0.45em;
  /*
  @media screen and (max-width: 450px) {
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  } */
`

export default function Panel(props: IPanel) {
  const { show, setShow, props: p, form, setForm } = props
  const confirm =
    typeof p?.onConfirm !== 'function'
      ? p?.onConfirm
      : { onClick: p?.onConfirm }

  const cancel =
    typeof p?.onCancel !== 'function' ? p?.onCancel : { onClick: p?.onCancel }

  if (!show) return null
  return (
    <Modal {...{ show, setShow, customize: { panel } }}>
      <div
        style={{
          padding: '1.2em 0.4em',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {p?.message ? (
          <p style={{ margin: '15px 20px' }}>{p?.message}</p>
        ) : (
          cloneElement(p?.content as ReactElement ?? <></>, {
            form,
            setForm,
            show,
            setShow,
          })
        )}
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <Button
            {...confirm}
            $bg={confirm?.color ?? "#03a73a"}
            onClick={(evt) => {
              if (confirm?.onClick)
                return setTimeout(
                  () => confirm?.onClick?.(setShow, form, evt),
                  100
                )
              setShow?.(false)
            }}
          >
            {confirm?.label ?? 'Adicionar'}
          </Button>
          <Button
            {...cancel}
            $bg={cancel?.color ?? "#ff4747"}
            onClick={(evt) => {
              if (cancel?.onClick)
                return setTimeout(
                  () => cancel?.onClick?.(setShow, form, evt),
                  100
                )
              setShow?.(false)
            }}
          >
            {cancel?.label ?? 'Cancelar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
