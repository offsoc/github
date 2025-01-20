import {Box, Button, Text} from '@primer/react'

import {BUTTON_LABELS} from '../../../constants/buttons'

type Props = {
  onCancel: () => void
  onSave?: () => void
  leadingText: string
}

export default function SelectTeamsFooter({onCancel, onSave, leadingText}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        p: 3,
        gap: 2,
        alignItems: 'center',
        borderTop: '1px solid',
        borderTopColor: 'border.muted',
      }}
    >
      <Text sx={{fontSize: 0, color: 'fg.muted'}}>{leadingText}</Text>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
        <Button onClick={onCancel}>{BUTTON_LABELS.cancel}</Button>
        <Button variant="primary" onClick={onSave}>
          {BUTTON_LABELS.save}
        </Button>
      </Box>
    </Box>
  )
}
