import styled, { css } from 'styled-components'
import Card from '../../../components/Card'
import { Product, ProductSupermarket, ProductTypes } from '../../../util/types'
import { BiMinus } from 'react-icons/bi'
import { FaPen } from 'react-icons/fa6'
import { skeleton } from '../../../components/Loading/Skeleton'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { currency } from '../../../util'

interface ListCardProps<T extends ProductTypes> {
  product: Product<T>
  path: T
  id?: string
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

export default function ListCard<T extends ProductTypes>(
  props: ListCardProps<T>
) {
  const navigate = useNavigate()
  const { product: p, handleRemove, loading, path, id } = props
  const product = p as ProductSupermarket
  return (
    <Link
      to={`/${path}/${product?.id}`}
      style={{ color: 'inherit', textDecoration: 'none' }}
    >
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              className="label"
              style={{ color: 'var(--color-title-card)' }}
            >
              {product?.description}
            </span>

            <b
              className="label"
              style={{ color: 'var(--color-title-card)' }}
            >
              {currency.format(product?.price)}
            </b>
          </div>
          <span
            className="date"
            style={{ color: 'var(--color-subtitle-card)' }}
          >
            {product?.category}
          </span>
          <span
            className="date"
            style={{ color: 'var(--color-subtitle-card)' }}
          >
            Atualizado em:{' '}
            {!!product.last_update &&
              format(new Date(product?.last_update), 'dd/MM/yyyy')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ButtonEdit
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              navigate(`/${path}/${id}/update/${product.id}`)
            }}
          >
            {!loading && <FaPen size={20} />}
          </ButtonEdit>
          <ButtonRemove
            className="button"
            onClick={(evt) => {
              evt.preventDefault()
              handleRemove(product.id)
            }}
          >
            {!loading && <BiMinus size={20} />}
          </ButtonRemove>
        </div>
      </Card>
    </Link>
  )
}
