import {AlertIcon} from '@primer/octicons-react'
import {ActionList, Box, Dialog, Spinner} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useRef, useState} from 'react'

import {CursorPagination} from '../../common/components/cursor-pagination'
import {tryFetchJson} from '../../common/utils/fetch-json'
import {appendParam} from '../../common/utils/url'
import type {AggregateCount} from '../types/push-protection-metrics'
import {AggregateCountListItem} from './AggregateMetricsList'

export interface CountsPage {
  counts: AggregateCount[]
  previousCursor?: string
  nextCursor?: string
}

interface SeeAllMetricsButtonProps {
  header: string
  label: string
  href: string
  baseIndexLink?: string
}

export function SeeAllMetricsButton({header, label, href, baseIndexLink}: SeeAllMetricsButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  return (
    <>
      <ActionList.Item sx={{color: 'fg.muted'}} ref={buttonRef} onSelect={() => setIsOpen(true)}>
        {label}
      </ActionList.Item>
      <AggregateMetricsListDialog
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        header={header}
        returnFocus={buttonRef}
        href={href}
        baseIndexLink={baseIndexLink}
      />
    </>
  )
}

interface AggregateMetricsListDialogProps {
  isOpen: boolean
  onDismiss: () => void
  header: string
  returnFocus: React.RefObject<HTMLElement>
  href: string
  baseIndexLink?: string
}

type FetchResponse = {payload: CountsPage}

function AggregateMetricsListDialog({
  isOpen,
  onDismiss,
  header,
  returnFocus,
  href,
  baseIndexLink,
}: AggregateMetricsListDialogProps): JSX.Element {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const {data, isLoading, isError} = useQuery({
    queryKey: [isOpen, cursor, href],
    queryFn: async () => {
      if (!isOpen) return null

      const url = cursor ? appendParam({baseUrl: href, param: 'cursor', value: cursor}) : href
      const res = await tryFetchJson<FetchResponse>(url)
      if (!res?.payload) throw new Error('Failed to load metrics: request failed')

      return res.payload
    },
  })

  // Disable scrolling
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return (): void => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <Dialog
      isOpen={isOpen}
      onDismiss={onDismiss}
      // TODO why doesn't Mac VoiceOver read aria-labelledby
      aria-label={header}
      returnFocusRef={returnFocus}
      sx={{
        overflowY: 'auto',
      }}
    >
      <Dialog.Header>{header}</Dialog.Header>
      {isLoading && <Spinner sx={{display: 'block', m: 3}} srText="Loading metrics" />}
      {isError && requestErrorBlankslate()}
      {data && (
        <>
          <ActionList showDividers>{data.counts.map(count => AggregateCountListItem(count, baseIndexLink))}</ActionList>
          <CursorPagination
            previousCursor={data.previousCursor}
            nextCursor={data.nextCursor}
            onPageChange={newCursor => {
              setCursor(newCursor)
            }}
          />
        </>
      )}
    </Dialog>
  )
}

function requestErrorBlankslate(): JSX.Element {
  return (
    <Box
      data-testid="page-push-protection-metrics-request-error-blankslate"
      sx={{
        width: '100%',
        height: 258,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Blankslate>
        <Blankslate.Visual>
          <AlertIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>Secret scanning data could not be loaded right now</Blankslate.Heading>
      </Blankslate>
    </Box>
  )
}
