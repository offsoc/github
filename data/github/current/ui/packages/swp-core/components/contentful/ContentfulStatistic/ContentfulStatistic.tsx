import {Statistic, type AnimateProps} from '@primer/react-brand'
import type {PrimerComponentStatistic} from '../../../schemas/contentful/contentTypes/primerComponentStatistic'

export type ContentfulStatisticProps = {
  component: PrimerComponentStatistic
  animate?: AnimateProps
  className?: string
}

export function ContentfulStatistic({component, animate, className}: ContentfulStatisticProps) {
  const {heading, size, variant, description, descriptionVariant} = component.fields

  return (
    <Statistic className={className} variant={variant} size={size} animate={animate}>
      <Statistic.Heading>{heading}</Statistic.Heading>
      <Statistic.Description variant={descriptionVariant}>{description}</Statistic.Description>
    </Statistic>
  )
}
