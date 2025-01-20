import {ActionList} from '@primer/react'

export type HIDE_OPTIONS = 'SPAM' | 'ABUSE' | 'OFF_TOPIC' | 'OUTDATED' | 'DUPLICATE' | 'RESOLVED'

export const HIDE_OPTION_TO_READABLE_MAP: Record<string, string> = {
  SPAM: 'Spam',
  ABUSE: 'Abuse',
  OFF_TOPIC: 'Off-topic',
  OUTDATED: 'Outdated',
  DUPLICATE: 'Duplicate',
  RESOLVED: 'Resolved',
}

export const HideCommentActionItems = ({
  setMenuOpen,
  onSelect,
}: {
  setMenuOpen?: (open: boolean) => void
  onSelect: (selectedOption: HIDE_OPTIONS) => void
}) => {
  return (
    <>
      {Object.keys(HIDE_OPTION_TO_READABLE_MAP).map(option => (
        <ActionList.Item
          key={option}
          aria-label={`Hide comment as ${HIDE_OPTION_TO_READABLE_MAP[option]!}`}
          onSelect={() => {
            onSelect(option as HIDE_OPTIONS)
            setMenuOpen?.(false)
          }}
        >
          {HIDE_OPTION_TO_READABLE_MAP[option]}
        </ActionList.Item>
      ))}
    </>
  )
}
