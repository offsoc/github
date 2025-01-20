import type React from 'react'
import {Box, Spinner} from '@primer/react'
import {HeroStat} from './HeroStat'
import type {SeriesData, HeroStatData} from '../types'

interface Props extends React.ComponentProps<typeof Box> {
  error?: string
  height?: number
  heroStats?: HeroStatData[]
  loading?: boolean
  series?: SeriesData
  title: string
}

const gridTemplateColumns = (length: number) => {
  // fit all content on 1 row, with a minimum of 3 columns per row
  let numColumns = length < 3 ? 3 : length
  // and a maximum of 6 columns per row
  numColumns = numColumns > 6 ? 6 : numColumns

  return new Array(numColumns).fill('1fr').join(' ')
}

export const Chart = ({height = 300, heroStats = [], loading, series, title, error, ...restProps}: Props) => {
  return (
    <Box aria-live="polite" aria-busy={!!loading} {...restProps}>
      <h3 className="mb-3">{title}</h3>

      {!!heroStats.length && (
        <Box
          sx={{
            display: ['block', 'block', 'grid', 'grid'],
            gap: 4,
            gridTemplateColumns: gridTemplateColumns(heroStats.length),
            justifyContent: 'space-between',
            my: 4,
          }}
        >
          {heroStats.map(heroStat => (
            <HeroStat key={`${title}-${heroStat.label}`} sx={{marginTop: [2, 2, 0, 0]}} {...heroStat} />
          ))}
        </Box>
      )}

      <Box className="height-full" sx={{my: 4}}>
        <Box sx={{height, position: 'relative'}}>
          {loading ? (
            // Bypass the internal chart loading state since the web component is rendered on the client; this ensures
            // a loading indicator is present on the first render, even if that happens on the server
            <Spinner
              data-testid="loading-indicator"
              sx={{margin: 'auto', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}
            />
          ) : (
            // See https://insights-docs.githubapp.com/v1/line-chart for supported attributes
            <line-chart data-testid="line-chart" error={error || null} series={JSON.stringify(series)} />
          )}
        </Box>
      </Box>
    </Box>
  )
}
