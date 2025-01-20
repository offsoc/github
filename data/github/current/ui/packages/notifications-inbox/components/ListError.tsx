import {BUTTON_LABELS} from '@github-ui/issue-viewer/ButtonLabels'
import {AlertFillIcon, type Icon} from '@primer/octicons-react'
import {Link, Octicon, Text} from '@primer/react'
import type {FC} from 'react'

import {LABELS} from '../notifications/constants/labels'

type ErrorProps = {
  title: string
  message: string
  retry?: () => void
  icon?: Icon
  retryText?: string
}

export const Error: FC<ErrorProps> = ({retry, icon, title, message, retryText}) => (
  <div className="blankslate">
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

export const ListError = (retry: () => void) => (
  <Error retry={retry} title={LABELS.failedToLoadInbox} message={LABELS.errorLoading} />
)
