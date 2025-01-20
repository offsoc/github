import {Box, Text} from '@primer/react'
import {format} from 'date-fns'
import type {Log, LogLevel} from '../../../../types'
import {useThemeColor} from './use-theme-color'
import {NoBreak} from '../../../../components/NoBreak'

interface Props {
  isGrouped?: boolean
  log: Log
}

const loggedAtColorMap: Record<LogLevel, string> = {
  LOG_STATE_UNSPECIFIED: 'colors.fg.muted',
  LOG_STATE_INFO: 'colors.fg.muted',
  LOG_STATE_WARNING: 'colors.attention.fg',
  LOG_STATE_ERROR: 'colors.danger.fg',
}

const messagePrefixMap: Record<LogLevel, string> = {
  LOG_STATE_UNSPECIFIED: '',
  LOG_STATE_INFO: '',
  LOG_STATE_WARNING: 'Warning: ',
  LOG_STATE_ERROR: 'Error: ',
}

export function Log({isGrouped = false, log}: Props) {
  const getThemeColor = useThemeColor()

  const loggedAtDate = format(new Date(log.logged_at), 'yyyy-MM-dd')
  const loggedAtTime = format(new Date(log.logged_at), 'HH:mm:ss')
  const loggedAtColor = loggedAtColorMap[log.log_level]
  const messagePrefix = messagePrefixMap[log.log_level]

  return (
    <Box
      sx={{
        display: 'flex',
        fontFamily: 'var(--fontStack-monospace)',
        fontSize: '12px',
        gap: '8px',
        lineHeight: '20px',
        pl: isGrouped ? '16px' : undefined,
        width: '100%',
      }}
    >
      <Text sx={{color: getThemeColor(loggedAtColor), flexShrink: 0, width: ['10ch', '19ch']}}>
        <NoBreak>{loggedAtDate}</NoBreak> <NoBreak>{loggedAtTime}</NoBreak>
      </Text>
      <Text sx={{color: getThemeColor('colors.fg.default'), wordBreak: 'break-word'}}>
        <Text sx={{color: getThemeColor(loggedAtColor), fontWeight: 'bold'}}>{messagePrefix}</Text>
        {log.message}
      </Text>
    </Box>
  )
}
