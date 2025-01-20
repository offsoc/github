import {testIdProps} from '@github-ui/test-id-props'
import {CalendarIcon, RocketIcon, SingleSelectIcon} from '@primer/octicons-react'
import {Box, Octicon, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {ElementType, ReactNode} from 'react'

import type {MemexStatus} from '../../../api/memex/contracts'
import {formatISODateString} from '../../../helpers/parsing'
import {SanitizedMarkdownViewer} from '../../common/sanitized-markdown-viewer'
import {SingleSelectToken} from '../../fields/single-select/single-select-token'

type Props = {
  status: MemexStatus
}

const statusUpdateItemRowStyle: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 3,
  width: '100%',
  lineHeight: '32px',
}

const ItemDetailsRow = ({
  label,
  icon,
  children,
  testId,
}: {
  label: string
  icon: ElementType<any>
  children: ReactNode
  testId: string
}) => {
  return (
    <Box sx={statusUpdateItemRowStyle}>
      <Text
        as="p"
        sx={{
          fontSize: 14,
          marginBottom: 0,
          wordBreak: 'break-word',
          width: '122px',
          flexShrink: 0,
          ml: 3,
          color: 'fg.muted',
        }}
      >
        <Octicon icon={icon} sx={{color: 'fg.subtle', mr: 2}} />
        {label}:
      </Text>
      <Box
        {...testIdProps(`status-update-item-value-${testId}`)}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          fontSize: 14,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

const statusUpdateItemBodyStyle: BetterSystemStyleObject = {
  flexGrow: 1,
  width: '100%',
  minWidth: 0,
  my: 2,
}

export const StatusUpdateItemBody = ({status}: Props) => {
  const {startDate, targetDate, status: statusOption} = status.statusValue
  const {bodyHtml} = status
  const hasStatusValues = !!startDate || !!targetDate || !!statusOption

  return (
    <Box sx={statusUpdateItemBodyStyle}>
      {startDate && (
        <ItemDetailsRow label="Start date" icon={CalendarIcon} testId="start-date">
          {formatISODateString(new Date(startDate))}
        </ItemDetailsRow>
      )}
      {targetDate && (
        <ItemDetailsRow label="Target date" icon={RocketIcon} testId="target-date">
          {formatISODateString(new Date(targetDate))}
        </ItemDetailsRow>
      )}
      {status && statusOption && (
        <ItemDetailsRow label="Status" icon={SingleSelectIcon} testId="status">
          <SingleSelectToken option={statusOption} />
        </ItemDetailsRow>
      )}
      {bodyHtml && (
        <Box sx={{px: 3, pt: hasStatusValues ? 2 : 1, pb: 1}} {...testIdProps(`status-update-item-value-body`)}>
          <SanitizedMarkdownViewer unverifiedHTML={bodyHtml} loading={false} />
        </Box>
      )}
    </Box>
  )
}
