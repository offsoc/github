import type {SxProp} from '@primer/react'
import {Box, useTheme, Text, Stack} from '@primer/react'
import Counter from './Counter'
import {Description} from './Description'
import List from './List'
import ProgressBar from './ProgressBar'
import {NoData} from './NoData'
import type {PropsWithChildren, ReactNode} from 'react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export type DataCardProps = PropsWithChildren<
  SxProp & {
    cardTitle?: string
    action?: ReactNode
    loading?: boolean
    error?: boolean
    noData?: boolean
  }
>

function DataCardBody({
  loading,
  error,
  noData,
  children,
}: Pick<DataCardProps, 'loading' | 'error' | 'noData' | 'children'>) {
  const {theme} = useTheme()
  const textDescriptionHeight = parseInt(theme?.fontSizes[0]) * theme?.lineHeights.default
  if (loading) {
    return (
      <>
        <LoadingSkeleton
          data-testid="data-card-loading-skeleton"
          sx={{height: theme?.fontSizes[4], width: 75}}
          variant="rounded"
        />
        <LoadingSkeleton
          sx={{height: textDescriptionHeight, mt: 2, mb: '10px', width: 200, borderRadius: '6px'}}
          variant="rounded"
        />
      </>
    )
  }

  if (error) {
    return <Description sx={{color: 'attention.fg'}}>Data could not be loaded right now</Description>
  }

  if (noData) {
    return (
      <>
        <NoData />
        <Description>No data exists for this metric with the given filters.</Description>
      </>
    )
  }

  if (children) {
    return <>{children}</>
  }

  return (
    <>
      <NoData />
      <Description>No data exists for this metric.</Description>
    </>
  )
}

function DataCard({loading, error, noData, children, cardTitle, action, sx, ...otherProps}: DataCardProps) {
  const cardStyle = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'border.default',
    borderRadius: 6,
    width: '270px',
    paddingTop: '12px',
    paddingBottom: '6px',
    paddingX: '16px',
    flexGrow: 1,
    ...sx,
  }

  return (
    <Box sx={cardStyle} {...otherProps}>
      <Stack direction="horizontal" justify="space-between">
        {cardTitle && (
          <Text as="p" sx={{fontWeight: '600'}}>
            {cardTitle}
          </Text>
        )}
        {action}
      </Stack>
      <DataCardBody loading={loading} error={error} noData={noData}>
        {children}
      </DataCardBody>
    </Box>
  )
}

//Child Components
DataCard.Description = Description
// Path: ui/packages/data-card/Counter.tsx
DataCard.Counter = Counter
// Path: ui/packages/data-card/ProgressBar.tsx
DataCard.ProgressBar = ProgressBar
// Path: ui/packages/data-card/List.tsx
DataCard.List = List

export default DataCard
