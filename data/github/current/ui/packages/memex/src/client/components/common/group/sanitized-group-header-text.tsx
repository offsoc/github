import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {SanitizedHtml} from '../../dom/sanitized-html'

export function SanitizedGroupHeaderText({titleHtml, sx}: {titleHtml: string; sx?: BetterSystemStyleObject}) {
  return (
    <SanitizedHtml
      sx={{
        color: 'fg.default',
        fontWeight: 'bold',
        fontSize: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...sx,
      }}
      {...testIdProps(`group-name`)}
    >
      {titleHtml}
    </SanitizedHtml>
  )
}
