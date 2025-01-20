import {Box, Grid, type AnimateProps, type GridColumnIndex, type ImageAspectRatio} from '@primer/react-brand'

import type {PrimerCards} from '../../../schemas/contentful/contentTypes/primerCards'
import {ContentfulCard} from '../ContentfulCard/ContentfulCard'

/**
 * Uses TypeScript discriminated union to ensure the component accepts either a `component`
 * or a `cards` prop, but not both. This increases the flexibility
 * of this component by supporting either a primerCards entry or a
 * plain array of primerComponentCard entries.
 */
export type ContentfulCardsProps = {
  className?: string
  hasBorder?: boolean
  spanOpts?: {[key: string]: GridColumnIndex}
  fullWidth?: boolean
  animate?: AnimateProps
  imageAspectRatio?: ImageAspectRatio
} & (
  | {
      cards?: never
      component: PrimerCards
    }
  | {
      cards: PrimerCards['fields']['cards']
      component?: never
    }
)

export function ContentfulCards({
  cards,
  component,
  hasBorder = false,
  fullWidth = false,
  animate,
  imageAspectRatio,
  className,
  spanOpts,
}: ContentfulCardsProps) {
  const collection = component !== undefined ? component.fields.cards : cards

  const desktop = collection.length > 2 ? 4 : 6

  const span: {[key: string]: GridColumnIndex} = {
    xsmall: 12,
    small: 12,
    medium: 6,
    large: desktop,
    xlarge: desktop,
    xxlarge: desktop,
    ...spanOpts,
  }

  return (
    <Grid className={className}>
      {collection.map(card => (
        <Grid.Column span={span} key={card.sys.id}>
          <Box animate={animate} className="height-full">
            <ContentfulCard
              component={card}
              className="height-full"
              hasBorder={hasBorder}
              fullWidth={fullWidth}
              imageAspectRatio={imageAspectRatio}
            />
          </Box>
        </Grid.Column>
      ))}
    </Grid>
  )
}
