import {Dialog} from '@primer/react/experimental'
import {Link, Text} from '@primer/react'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {useEffect} from 'react'

export type BranchNextStepDesktopProps = {
  branch: string | null
  repository: string
  owner: string
  onClose: () => void
}

export const BranchNextStepDesktop = ({branch, repository, owner, onClose}: BranchNextStepDesktopProps) => {
  const desktopUrl = `x-github-client://openRepo/${ssrSafeWindow?.origin}/${owner}/${repository}?${branch}`

  useEffect(() => {
    if (ssrSafeWindow) {
      ssrSafeWindow.location.replace(desktopUrl)
    }
  }, [desktopUrl])

  return (
    <Dialog width="large" height="auto" title={'Opening branch in GitHub Desktop...'} onClose={onClose}>
      <Text
        sx={{
          color: 'fg.muted',
          fontSize: 12,
        }}
      >
        If nothing happens, make sure&nbsp;
        <Link inline target="_blank" href="https://desktop.github.com/" rel="noreferrer">
          GitHub Desktop
        </Link>
        &nbsp;is installed and set up properly, then&nbsp;
        <Link inline href={desktopUrl}>
          try again
        </Link>
        .
      </Text>
    </Dialog>
  )
}
