import styled, { css } from 'styled-components'
import Card from '../../../components/Card'
import { Reciept } from '../../../util/types'
import { BiMinus } from 'react-icons/bi'
import { FaPen } from 'react-icons/fa6'
import { skeleton } from '../../../components/Loading/Skeleton'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { currency, decimalSum } from '../../../util'

interface ListCardProps {
  reciept: Reciept
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
  .price,
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

  .price {
    height: 20px;
    width: 60px;
  }
`

export default function ListCard(props: ListCardProps) {
  const navigate = useNavigate()
  const { reciept, handleRemove, loading } = props
  return (
    <Link to={`/reciepts/${reciept?.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
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
          <span className="label" style={{ color: 'var(--color-title-card)' }}>{reciept.name}</span> 
          <span className="date" style={{ color: 'var(--color-subtitle-card)' }}>
            {!!reciept.date && format(new Date(reciept.date), 'dd/MM/yyyy')}
          </span>
          <span className='price'>
            {reciept.total && currency.format(decimalSum(Number(reciept.total ?? 0), -Number(reciept.discount ?? 0)))}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ButtonEdit
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              navigate(`/reciepts/update/${reciept.id}`)
            }}
          >
            {!loading && <FaPen size={20} />}
          </ButtonEdit>
          <ButtonRemove
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              handleRemove(reciept.id)
            }}
          >
            {!loading && <BiMinus size={20} />}
          </ButtonRemove>
        </div>
      </Card>
    </Link>
  )
}
