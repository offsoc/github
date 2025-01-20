import {SafeHTMLText} from '@github-ui/safe-html'
import {Truncate} from '@primer/react'

export function TitleText({isSticky, title, titleHTML}: {isSticky?: boolean; title: string; titleHTML: string}) {
  const titleText = (
    <SafeHTMLText
      unverifiedHTML={titleHTML}
      sx={{
        ...(isSticky ? {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'} : {display: 'inline'}),
        code: {
          borderRadius: 2,
          fontSize: 'inherit',
          lineHeight: 1,
          py: '2px',
          px: 1,
          backgroundColor: 'neutral.muted',
        },
      }}
    />
  )

  return isSticky ? (
    <Truncate sx={{maxWidth: 'unset'}} title={title}>
      {titleText}
    </Truncate>
  ) : (
    titleText
  )
}
