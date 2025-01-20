import DataCard from '@github-ui/data-card'
import type {Icon} from '@primer/octicons-react'
import {ActionList, Box, CounterLabel, Header, Octicon, Spinner, Text} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'

import {appendQuery} from '../../common/utils/url'
import {
  type AggregateCount,
  AggregateCountType,
  type BypassReasonCount,
  type RepositoryCount,
  type TokenTypeCount,
} from '../types/push-protection-metrics'

const MAX_TABLE_SIZE = 4

export interface AggregateMetricsListProps {
  icon?: Icon
  title: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'data-testid'?: string
  aggregateCounts: AggregateCount[]
  seeAllButton?: JSX.Element
  baseIndexLink?: string
  loading?: boolean
}

export function AggregateMetricsList({
  title,
  aggregateCounts,
  icon,
  'data-testid': testId,
  seeAllButton,
  baseIndexLink,
  loading,
}: AggregateMetricsListProps): JSX.Element {
  return (
    <DataCard data-testid={testId} sx={{display: 'flex', flexDirection: 'column', padding: 0, minHeight: 216}}>
      <Header
        as="summary"
        sx={{
          backgroundColor: 'canvas.subtle',
          borderColor: 'border.default',
          borderWidth: 1,
          borderTopRightRadius: 2,
          borderTopLeftRadius: 2,
          borderBottomStyle: 'solid',
          paddingX: 3,
          paddingY: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'border.muted',
        }}
      >
        {ListHeading(title, icon)}
      </Header>
      {MetricList(aggregateCounts, seeAllButton, baseIndexLink, loading)}
    </DataCard>
  )
}

function ListHeading(title: string, icon?: Icon): JSX.Element {
  if (icon) {
    return (
      <>
        <Octicon icon={icon} size={16} sx={{color: 'fg.default'}} />
        <Text sx={{color: 'fg.default', fontSize: 1, fontWeight: 'bold', p: 1}}>{title}</Text>
      </>
    )
  }

  return <Text sx={{color: 'fg.default', fontSize: 1, fontWeight: 'bold', pl: 0, pr: 0, pt: 1, pb: 1}}>{title}</Text>
}

function MetricList(
  aggregateCounts: AggregateCount[],
  seeAllButton?: JSX.Element,
  baseIndexLink?: string,
  loading?: boolean,
): JSX.Element {
  if (loading) {
    return (
      <Box
        data-testid="metrics-list-loading-skeleton"
        sx={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}
      >
        <Spinner />
      </Box>
    )
  }

  if (aggregateCounts.length) {
    return (
      <ActionList showDividers>
        {aggregateCounts.map(count => AggregateCountListItem(count, baseIndexLink))}
        {aggregateCounts.length >= MAX_TABLE_SIZE && seeAllButton}
      </ActionList>
    )
  }

  return emptyListBlankSlate()
}

function emptyListBlankSlate(): JSX.Element {
  return (
    <Box
      data-testid="empty-metrics-list-blankslate"
      sx={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}
    >
      <Blankslate>
        <Blankslate.Heading>
          <Text sx={{fontSize: '24px', fontWeight: 'normal', color: 'fg.muted'}}>No data</Text>
        </Blankslate.Heading>
        <Blankslate.Description>Try modifying your filters or clear your search.</Blankslate.Description>
      </Blankslate>
    </Box>
  )
}

export function AggregateCountListItem(count: AggregateCount, baseIndexLink?: string): JSX.Element | null {
  switch (count.type) {
    case AggregateCountType.TokenType:
      return baseIndexLink ? TokenTypeLinkItem(count, baseIndexLink) : TokenTypeListItem(count)
    case AggregateCountType.Repository:
      return baseIndexLink ? RepoLinkItem(count, baseIndexLink) : RepoListItem(count)
    case AggregateCountType.BypassReason:
      return BypassReasonListItem(count)
    default:
      return null
  }
}

function TokenTypeListItem(count: TokenTypeCount): JSX.Element {
  let tokenTypeDisplayName = count.name

  if (count.hasMetadata) {
    if (count.isCustomPattern) {
      tokenTypeDisplayName += ' (custom pattern)'
    }

    return (
      <ActionList.Item key={tokenTypeDisplayName} disabled={true} sx={{cursor: 'auto !important'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text sx={{color: 'fg.default'}}>{tokenTypeDisplayName}</Text>
          {/* CounterLabel isn't in an ActionList.TrailingVisual so that it's read by screen reader. */}
          {/* We can convert back into TrailingVisual if it gets fixed (Primer team has been made aware). */}
          <CounterLabel>{count.count}</CounterLabel>
        </Box>
      </ActionList.Item>
    )
  } else {
    return (
      <ActionList.Item key={tokenTypeDisplayName} disabled={true} sx={{cursor: 'auto !important'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text sx={{color: 'fg.default'}}>{tokenTypeDisplayName}</Text>
          <CounterLabel>{count.count}</CounterLabel>
        </Box>
      </ActionList.Item>
    )
  }
}

function TokenTypeLinkItem(count: TokenTypeCount, baseIndexLink: string): JSX.Element {
  let tokenTypeDisplayName = count.name

  if (count.hasMetadata) {
    if (count.isCustomPattern) {
      tokenTypeDisplayName += ' (custom pattern)'
    }

    return (
      <ActionList.LinkItem
        key={tokenTypeDisplayName}
        href={appendQuery({baseUrl: baseIndexLink, query: `secret-type:${count.slug}`})}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text sx={{textDecoration: 'underline', color: 'accent.fg'}}>{tokenTypeDisplayName}</Text>
          {/* CounterLabel isn't in an ActionList.TrailingVisual so that it's read by screen reader. */}
          {/* We can convert back into TrailingVisual if it gets fixed (Primer team has been made aware). */}
          <CounterLabel>{count.count}</CounterLabel>
        </Box>
      </ActionList.LinkItem>
    )
  } else {
    return (
      <ActionList.Item key={tokenTypeDisplayName} disabled={true} sx={{cursor: 'auto !important'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text sx={{color: 'fg.default'}}>{tokenTypeDisplayName}</Text>
          <CounterLabel>{count.count}</CounterLabel>
        </Box>
      </ActionList.Item>
    )
  }
}

function RepoListItem(count: RepositoryCount): JSX.Element {
  return (
    <ActionList.Item key={count.name} disabled={true} sx={{cursor: 'auto !important'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text sx={{color: 'fg.default'}}>{count.name}</Text>
        <CounterLabel>{count.count}</CounterLabel>
      </Box>
    </ActionList.Item>
  )
}

function RepoLinkItem(count: RepositoryCount, baseIndexLink: string): JSX.Element {
  return (
    <ActionList.LinkItem key={count.name} href={appendQuery({baseUrl: baseIndexLink, query: `repo:${count.name}`})}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text sx={{textDecoration: 'underline', color: 'accent.fg'}}>{count.name}</Text>
        <CounterLabel>{count.count}</CounterLabel>
      </Box>
    </ActionList.LinkItem>
  )
}

function BypassReasonListItem(count: BypassReasonCount): JSX.Element {
  let counterLabelText = String(count.count)
  if (count.count) {
    counterLabelText = `${count.count} (${count.percent}%)`
  }

  return (
    <ActionList.Item key={count.name} disabled={true} sx={{cursor: 'auto !important'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text sx={{color: 'fg.default'}}>{count.name}</Text>
        <CounterLabel>{counterLabelText}</CounterLabel>
      </Box>
    </ActionList.Item>
  )
}
