import type { Price } from "@repo/models/I18n"
import { priceConverter } from "@repo/models/I18n"
import { useFormatter } from "use-intl"

export interface PriceDisplayProps {
  price: Price
  className?: string
}
export const PriceDisplay: React.FC<PriceDisplayProps> = (props) => {
  const { price, className } = props
  const format = useFormatter()

  return (
    <span className={className}>
      {format.number(priceConverter.centsToMajorUnit(price.cents, price.currency), {
        style: "currency",
        currency: price.currency,
      })}
    </span>
  )
}
