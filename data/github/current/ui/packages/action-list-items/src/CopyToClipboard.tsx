import {copyText} from '@github-ui/copy-to-clipboard'
import {CopyIcon} from '@primer/octicons-react'
import {ActionList, type ActionListItemProps} from '@primer/react'
import {useCallback} from 'react'

export type ActionListItemCopyToClipboardProps = {
  /** The content intended to be copied to the clipboard. */
  textToCopy: string
} & Omit<ActionListItemProps, 'onSelect'>

export function ActionListItemCopyToClipboard({textToCopy, children, ...props}: ActionListItemCopyToClipboardProps) {
  const onSelect = useCallback(async () => {
    await copyText(textToCopy)
  }, [textToCopy])

  return (
    <ActionList.Item onSelect={onSelect} {...props}>
      <ActionList.LeadingVisual>
        <CopyIcon />
      </ActionList.LeadingVisual>
      {children}
    </ActionList.Item>
  )
}
