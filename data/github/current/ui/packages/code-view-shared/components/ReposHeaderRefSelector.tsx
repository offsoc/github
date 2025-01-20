import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {RefSelector} from '@github-ui/ref-selector'
import type {ButtonProps} from '@primer/react'

import {useRefCreateErrorHandling} from '../hooks/use-ref-create-error-handling'
import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import {useShortcut} from '../hooks/shortcuts'
import {useReposAnalytics} from '../hooks/use-repos-analytics'

export function ReposHeaderRefSelector({
  size,
  buttonClassName,
  allowResizing,
  idEnding,
}: {
  size?: ButtonProps['size']
  buttonClassName?: string
  allowResizing?: boolean
  idEnding?: string
}) {
  const repo = useCurrentRepository()
  const {refInfo, path, action} = useFilesPageInfo()
  const onCreateError = useRefCreateErrorHandling()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {refSelectorShortcut} = useShortcut()

  return (
    <RefSelector
      currentCommitish={refInfo.name}
      defaultBranch={repo.defaultBranch}
      owner={repo.ownerLogin}
      repo={repo.name}
      canCreate={repo.currentUserCanPush}
      cacheKey={refInfo.listCacheKey}
      selectedRefType={refInfo.refType}
      getHref={refName => `${repositoryTreePath({repo, commitish: refName, action, path})}${window.location.search}`}
      hotKey={refSelectorShortcut.hotkey}
      onBeforeCreate={refName => sendRepoClickEvent('REF_SELECTOR_MENU.CREATE_BRANCH', {['ref_name']: refName})}
      onCreateError={onCreateError}
      onOpenChange={open => open && sendRepoClickEvent('REF_SELECTOR_MENU')}
      size={size}
      buttonClassName={buttonClassName}
      allowResizing={allowResizing}
      idEnding={idEnding || 'repos-header-ref-selector'}
      useFocusZone={true}
    />
  )
}
