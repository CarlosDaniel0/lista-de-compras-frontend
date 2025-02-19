import { BsDot } from "react-icons/bs";
import Card from "../../../components/Card";
import { currency, decimal, genId } from "../../../util";
import { ProductRecieptImport } from "../../../util/types";

export default function ListItemProduct(props: { products: ProductRecieptImport[], product: ProductRecieptImport, i: number }) {
  const { product, i, products } = props
  return (
    <Card
      key={genId(`prod-${i}-`)}
      style={{
        padding: '0.8em 0.4em',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        margin: i === products.length - 1 ? '2px 5px 50px 5px' : '2px 5px',
      }}
    >
      <div>
        <span>{product?.position}</span>{' '}
      </div>
      <div style={{ flex: '1 0 0' }}>
        <div>
          <span style={{ color: 'var(--color-title-card)' }}>
            {product?.description}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--color-subtitle-card)' }}>
            {product?.barcode}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '1.1em',
              color: 'var(--color-legend-card)',
            }}
          >
            {decimal.format(Number(product?.quantity ?? 0))} {product?.unity}
            {!!Number(product?.price ?? 0) && (
              <>
                <BsDot />
                {currency.format(Number(product?.price ?? 0))}
              </>
            )}
            {!!Number(product?.discount ?? 0) && (
              <span style={{ color: 'var(--green)' }}>
                {'  '}- {currency.format(product?.discount)}
              </span>
            )}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {(!!Number(product?.total ?? 0) || !!Number(product?.price ?? 0)) && (
          <b
            style={{
              color: 'var(--color-title-card)',
              fontSize: '1.25em',
            }}
          >
            {currency.format(product?.total)}
          </b>
        )}
      </div>
    </Card>
  )
}
