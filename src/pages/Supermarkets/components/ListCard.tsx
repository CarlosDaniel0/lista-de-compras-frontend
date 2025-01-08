import styled, { css } from 'styled-components'
import Card from '../../../components/Card'
import { Supermarket } from '../../../util/types'
import { BiMinus } from 'react-icons/bi'
import { FaPen } from 'react-icons/fa6'
import { skeleton } from '../../../components/Loading/Skeleton'
import { Link, useNavigate } from 'react-router-dom'

interface ListCardProps {
  supermarket: Supermarket
  handleRemove: (id: string) => void
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
  const navigate = useNavigate()
  const { supermarket, handleRemove, loading } = props
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
              navigate(`/supermarkets/update/${supermarket.id}`)
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
