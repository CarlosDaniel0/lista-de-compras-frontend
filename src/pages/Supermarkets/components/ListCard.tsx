import styled, { css } from 'styled-components'
import Card from '../../../components/Card'
import { Supermarket } from '../../../util/types'
import { BiMinus } from 'react-icons/bi'
import { FaPen } from 'react-icons/fa6'
import { DialogService } from '../../../contexts/Dialog'
import { skeleton } from '../../../components/Loading/Skeleton'
import { Link } from 'react-router-dom'
import { FormList } from '../../Lists/components/CreateOrUpdatePanel'

interface ListCardProps {
  supermarket: Supermarket
  handleEdit: (list: Supermarket) => void
  handleRemove: (id: string) => void
  Dialog: DialogService
  loading: boolean
}

const iconButton = css`
  outline: none;
  border: none;
  cursor: pointer;
  border-radius: 100%;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;

  
  &:active {
    scale: 0.89;
    transition: scale 0.15s ease-in;
  }
`

const ButtonEdit = styled.button`
  ${iconButton}
  background: transparent;
  color: #3683ff;
`

const ButtonRemove = styled.button`
  ${iconButton}
  background: #df4242;
  color: #fff;
`

const loadingSkeleton = css`
  .label,
  .date,
  .button {
    ${skeleton}
  }

  .label {
    height: 20px;
    width: 150px;
  }

  .date {
    height: 20px;
    width: 80px;
  }
`

export default function ListCard(props: ListCardProps) {
  const { supermarket, handleEdit, handleRemove, Dialog, loading } = props
  return (
    <Link to={`/supermarket/${supermarket?.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
      <Card
        css={loading ? loadingSkeleton : undefined}
        style={{
          padding: '0.8em 0.4em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '2px 5px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="label" style={{ color: 'var(--color-title-card)' }}>{supermarket.name}</span> 
          <span className="date" style={{ color: 'var(--color-subtitle-card)' }}>
            {supermarket.address}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ButtonEdit
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              Dialog.info.show({
                content: (
                  <></>
                ),
                form: { name: supermarket.name },
                onConfirm: {
                  label: 'Confirmar',
                  color: '#00a365',
                  onClick: (setShow, form: FormList) => {
                    if (!form?.name) return
                    setShow(false)
                    handleEdit({ ...supermarket, name: form?.name })
                  },
                },
              })
            }}
          >
            {!loading && <FaPen size={20} />}
          </ButtonEdit>
          <ButtonRemove
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              handleRemove(supermarket.id)
            }}
          >
            {!loading && <BiMinus size={20} />}
          </ButtonRemove>
        </div>
      </Card>
    </Link>
  )
}
