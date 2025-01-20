import DataCard from '@github-ui/data-card'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {AlertIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {ActionList, Box, Button, CounterLabel, Dialog, Text} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import type {UseQueryResult} from '@tanstack/react-query'
import {useEffect, useRef, useState} from 'react'

import {CursorPagination} from '../../../common/components/cursor-pagination'
import useMostPrevalentRulesQuery, {type MostPrevalentRulesResult} from './use-most-prevalent-rules-query'

interface MostPrevalentRulesCardProps {
  query: string
  startDate: string
  endDate: string
}

export default function MostPrevalentRulesCard(props: MostPrevalentRulesCardProps): JSX.Element {
  const dataQuery = useMostPrevalentRulesQuery({...props, pageSize: 5})

  return (
    <DataCard cardTitle="Most prevalent rules">
      <RuleList {...{dataQuery}} />
      {dataQuery.data?.next && (
        <>
          <ActionList.Divider />
          <SeeAllDialog {...props} />
        </>
      )}
    </DataCard>
  )
}

export function SeeAllDialog(props: MostPrevalentRulesCardProps): JSX.Element {
  // track paging cursor; reset when query changes
  const [cursor, setCursor] = useState<string | undefined>()
  useEffect(() => setCursor(undefined), [props])

  const [isOpen, setIsOpen] = useState(false)
  const returnFocusRef = useRef(null)

  const dataQuery = useMostPrevalentRulesQuery({...props, cursor, pageSize: 10, enabled: isOpen})

  return (
    <>
      <Button
        data-testid="trigger-button"
        ref={returnFocusRef}
        onClick={() => setIsOpen(true)}
        variant={'invisible'}
        sx={{px: 0, color: 'fg.subtle'}}
      >
        See all rules
      </Button>
      <Dialog
        returnFocusRef={returnFocusRef}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="header"
      >
        <div data-testid="inner">
          <Dialog.Header id="header" sx={{backgroundColor: 'transparent'}}>
            Most prevalent rules
          </Dialog.Header>
          <Box sx={{p: 3}}>
            <RuleList {...{dataQuery}} />
            {dataQuery.isSuccess && (
              <CursorPagination
                previousCursor={dataQuery.data.previous}
                nextCursor={dataQuery.data.next}
                onPageChange={setCursor}
              />
            )}
          </Box>
        </div>
      </Dialog>
    </>
  )
}

interface RuleListProps {
  dataQuery: UseQueryResult<MostPrevalentRulesResult>
}
function RuleList({dataQuery}: RuleListProps): JSX.Element {
  if (dataQuery.isPending) {
    return (
      <ActionList variant={'full'} showDividers data-testid={'loading-container'}>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        {[...Array(5)].map((_, index) => (
          <ActionList.Item key={index} disabled={true} sx={{px: 0, cursor: 'auto !important'}}>
            <LoadingSkeleton as={'div'} variant={'rounded'} height={'md'} width={'random'} sx={{mb: 1}} />
            <LoadingSkeleton as={'div'} variant={'rounded'} height={'sm'} width={'60px'} />
          </ActionList.Item>
        ))}
      </ActionList>
    )
  }

  if (dataQuery.isError) {
    return (
      <Box data-testid={'error-blankslate'} sx={{py: 9}}>
        <Blankslate>
          <Blankslate.Visual>
            <AlertIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Description>Rule information could not be loaded right now</Blankslate.Description>
        </Blankslate>
      </Box>
    )
  }

  if (dataQuery.data.items.length === 0) {
    return (
      <Box data-testid={'empty-blankslate'} sx={{py: 9}}>
        <Blankslate>
          <Blankslate.Visual>
            <ShieldCheckIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Description>
            Try modifying your filters to see the security impact on your organization.
          </Blankslate.Description>
        </Blankslate>
      </Box>
    )
  }

  return (
    <ActionList variant={'full'} showDividers>
      {dataQuery.data.items.map(item => (
        <ActionList.Item
          key={item.ruleSarifIdentifier}
          // We're disabling these list items because we don't want them clickable.
          // This then means we need to counter the `disabled` styles :(
          // Once we implement drill-through, these will be clickable, so this workaround is temporary.
          disabled={true}
          sx={{px: 0, color: 'fg.muted', cursor: 'auto !important'}}
        >
          <Text sx={{color: 'fg.default'}}>{item.ruleName}</Text>
          <ActionList.Description variant="block">{item.ruleSarifIdentifier}</ActionList.Description>
          <ActionList.TrailingVisual>
            <CounterLabel>{item.count}</CounterLabel>
          </ActionList.TrailingVisual>
        </ActionList.Item>
      ))}
    </ActionList>
  )
}
