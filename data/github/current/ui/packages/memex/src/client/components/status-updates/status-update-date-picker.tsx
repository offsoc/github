import {DatePicker} from '@github-ui/date-picker'
import {SharedEmptyPicker} from '@github-ui/item-picker/SharedEmptyPicker'
import {testIdProps} from '@github-ui/test-id-props'
import type {IconProps} from '@primer/octicons-react'
import {Box, Button, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {formatISO} from 'date-fns'
import type {FunctionComponent, PropsWithChildren} from 'react'
import {useCallback, useState} from 'react'

import {formatDateString} from '../../helpers/parsing'

const datePickerContainerStyle: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 1,
}

type StatusUpdateDatePickerProps = {
  defaultDate?: Date | null
  onChange: (date: Date | null) => void
  testId: string
  icon: FunctionComponent<PropsWithChildren<IconProps>>
  label: string
  ariaLabel: string
}

export const StatusUpdateDatePicker = ({
  defaultDate,
  onChange,
  testId,
  icon,
  label,
  ariaLabel,
}: StatusUpdateDatePickerProps) => {
  const [localDate, setLocalDate] = useState<Date | null>(defaultDate ?? null)

  const handleDateChanged = useCallback(
    (date: Date | null) => {
      const convertedDate = date ? new Date(formatISO(date, {representation: 'date'})) : null

      setLocalDate(convertedDate)
      onChange(date)
    },
    [onChange],
  )

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      // In https://github.com/github/github/pull/309806 the `SharedPicker` component was refactored to address problems woth focusing management.
      // Due to the `DatePicker` having its own implementation of `ref`s we have decided to copy over the original implementation of the `SharedPicker`
      // instead of changing the API implementation of DatePicker.
      if (localDate) {
        const sharedProps = {
          'aria-label': ariaLabel,
          'aria-disabled': false,
          disabled: false,
        }

        return (
          <Button size={'small'} {...anchorProps} {...sharedProps}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Box sx={{color: 'fg.muted', fontWeight: 'normal'}}>{label}</Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '> *:not(:last-child)': {
                    mr: '-3px',
                  },
                }}
              >
                {<Octicon icon={icon} />}
              </Box>
              <Box sx={{fontWeight: 'bold'}}>{formatDateString(localDate)}</Box>
            </Box>
          </Button>
        )
      }

      return <SharedEmptyPicker label={label} leadingIcon={icon} anchorProps={anchorProps} />
    },
    [ariaLabel, icon, label, localDate],
  )

  return (
    <Box sx={datePickerContainerStyle} {...testIdProps(testId)}>
      <DatePicker
        onChange={handleDateChanged}
        value={localDate}
        showClearButton
        showTodayButton={false}
        anchor={renderAnchor}
      />
    </Box>
  )
}
