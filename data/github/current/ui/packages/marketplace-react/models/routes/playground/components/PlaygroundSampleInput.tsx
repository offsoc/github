import {PaperAirplaneIcon} from '@primer/octicons-react'
import {ActionList, Octicon} from '@primer/react'

export function PlaygroundSampleInput({message, onSubmit}: {message: string; onSubmit: () => void}) {
  return (
    <ActionList.Item
      sx={{
        bg: 'canvas.subtle',
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: 'var(--borderRadius-medium)',
        display: 'flex',
        backgroundColor: 'canvas.default',
        px: 2,
        my: 1,
        mx: 0,
        alignItems: 'center',
        width: 'fit-content',
      }}
      onSelect={onSubmit}
    >
      <ActionList.LeadingVisual>
        <Octicon icon={PaperAirplaneIcon} />
      </ActionList.LeadingVisual>
      <span>{message}</span>
    </ActionList.Item>
  )
}
