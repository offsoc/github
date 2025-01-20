import DataCard from '@github-ui/data-card'
import {Text} from '@primer/react'
import {Services} from '../services/services'
import type {IMetricsService} from '../services/metrics-service'
import {Observer} from '../observables/Observer'
import type {CardData} from '../models/models'

export const MetricsHeroCards = () => {
  const metricsService = Services.get<IMetricsService>('IMetricsService')
  const cardData = metricsService.getCardData()

  return (
    <Observer cardData={cardData}>
      {(obs: {cardData: Array<CardData | undefined>}) => {
        return (
          <div className="d-flex flex-row flex-content-stretch flex-wrap gutter-condensed">
            {obs.cardData.map((data, index) => (
              <MetricsHeroCard data={data} key={data?.metric ?? index} />
            ))}
          </div>
        )
      }}
    </Observer>
  )
}

const LoadingCard = () => <DataCard loading={true} sx={HERO_CARD_STYLING} />

interface MetricsHeroCardProps {
  data?: CardData
}

const MetricsHeroCard = (props: MetricsHeroCardProps) => {
  const card = props.data

  if (card) {
    return (
      <DataCard cardTitle={card.title} sx={HERO_CARD_STYLING}>
        <MetricsHeroCardContent data={card} />
        <DataCard.Description>{card.description}</DataCard.Description>
      </DataCard>
    )
  } else {
    return <LoadingCard />
  }
}

interface MetricsHeroCardContentProps {
  data: CardData
}

const MetricsHeroCardContent = (props: MetricsHeroCardContentProps) => {
  if (props.data.format) {
    return (
      <Text
        sx={{
          fontSize: '24px',
          fontWeight: 400,
          lineHeight: '24px',
        }}
      >
        {props.data.format && props.data.format(props.data.value)}
      </Text>
    )
  }

  return <DataCard.Counter count={props.data.value || 0} />
}

const HERO_CARD_STYLING = {
  mx: 2,
  mb: 3,
  // was having an odd bug where % wasn't working correctly, so for below values:
  // 50% -> 40%
  // 25% -> 21%
  // wrapping should work the same way either way
  flexBasis: [
    '100%', // default no sidebar
    '40%', // small       (min-width: 544px) no sidebar
    '21%', // medium    (min-width: 768px) no sidebar
    '40%', // large     (min-width: 1012px) sidebar
    '21%', // xlarge (min-width: 1280px) sidebar
  ],
}
