import {BUTTON_LABELS} from '@github-ui/issue-viewer/ButtonLabels'
import {AlertFillIcon, type Icon} from '@primer/octicons-react'
import {Link, Octicon, Text} from '@primer/react'
import type {FC} from 'react'

export type ListErrorProps = {
  title: string
  message: string
  retry?: () => void
  icon?: Icon
  retryText?: string
  testid?: string
}

export const ListError: FC<ListErrorProps> = ({retry, icon, title, message, retryText, testid}) => (
  <div className="blankslate" data-testid={testid}>
    <Octicon className="blankslate-icon" icon={icon ?? AlertFillIcon} sx={{color: 'attention.fg'}} />
    <h3 className="blankslate-heading">{title}</h3>
    <Text as="p" sx={{color: 'fg.muted'}}>
      {message}
    </Text>
    {retry && (
      <Link as="button" underline={true} onClick={retry} sx={{fontSize: 0}}>
        {retryText ?? BUTTON_LABELS.tryAgain}
      </Link>
    )}
  </div>
)
