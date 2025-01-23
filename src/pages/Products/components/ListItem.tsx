/* eslint-disable @typescript-eslint/no-unused-vars */
import { css } from 'styled-components'
import Card from '../../../components/Card'
import {
  Product,
  ProductList,
  ProductReciept,
  ProductSupermarket,
  ProductTypes,
} from '../../../util/types'
import { skeleton } from '../../../components/Loading/Skeleton'
// import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { currency, decimal } from '../../../util'
import { BsDot } from 'react-icons/bs'

interface ListCardProps<T extends ProductTypes>
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onContextMenu'> {
  onContextMenu?: (
    evt: React.MouseEvent<HTMLDivElement>,
    product: Product<T>
  ) => void
  product: Product<T>
  path: T
  id?: string
  loading: boolean
}

const loadingSkeleton = css`
  .index,
  .label,
  .category,
  .update,
  .price,
  .quantity,
  .button {
    ${skeleton}
  }

  .index {
    height: 20px;
    width: 15px;
  }

  .label {
    height: 20px;
    width: 200px;
    max-width: 100%;
  }

  .category {
    height: 20px;
    width: 140px;
    max-width: 70%;
  }

  .update {
    height: 20px;
    width: 200px;
    max-width: 100%;
  }

  .price {
    height: 24px;
    width: 80px;
  }

  .quantity {
    height: 24px;
    width: 90px;
  }
`

export default function ListCard<T extends ProductTypes>(
  props: ListCardProps<T>
) {
  // const navigate = useNavigate()

  const { product: p, loading, onContextMenu, path, ...rest } = props // handleRemove, path, id

  const product = p as ProductSupermarket & ProductList & ProductReciept
  return (
    <Card
      {...rest}
      onContextMenu={(evt) => onContextMenu?.(evt, product as Product<T>)}
      css={loading ? loadingSkeleton : undefined}
      style={{
        padding: '0.8em 0.4em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '2px 5px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          flex: '1 0 0',
        }}
      >
        {path === 'reciepts' && (
          <span
          className='index'
            style={{
              fontSize: '1.2em',
              alignSelf: 'center',
              width: 30,
              textAlign: 'center',
            }}
          >
            {product?.index}
          </span>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: '1 0 0',
          }}
        >
          <span className="label" style={{ color: 'var(--color-title-card)' }}>
            {product?.product?.description ?? product?.description}
          </span>
          <span
            className="category"
            style={{ color: 'var(--color-subtitle-card)' }}
          >
            {product?.product?.category ?? product?.category}
          </span>
          {path === 'supermarkets' && (
            <span
              className="update"
              style={{ color: 'var(--color-subtitle-card)' }}
            >
              {loading
                ? ''
                : `Atualizado em: ${
                    !!product.last_update &&
                    format(new Date(product?.last_update), 'dd/MM/yyyy')
                  }`}
            </span>
          )}
          {['lists', 'reciepts'].includes(path) && (
            <span
              className="quantity"
              style={{ fontSize: '1.1em', color: 'var(--color-legend-card)' }}
            >
              {loading ? (
                ''
              ) : (
                <>
                  {decimal.format(Number(product?.quantity ?? 0))}
                  {' '}
                  {product?.unity ?? product?.product?.unity}
                  <BsDot />
                  {currency.format(Number(product?.product?.price ?? product?.price ?? 0))}
                </>
              )}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: path === 'supermarkets' ? 'center' : 'end',
          }}
        >
          <b
            className="price"
            style={{ color: 'var(--color-title-card)', fontSize: '1.25em' }}
          >
            {loading
              ? ''
              : currency.format(Number(product?.total ?? product?.price ?? 0))}
          </b>
        </div>
      </div>
    </Card>
  )
}
