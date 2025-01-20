import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useMatch, useResolvedPath} from 'react-router-dom'

import type {CopilotTaskBasePayload} from '../utilities/copilot-task-types'
import {fileUrl, newFileUrl} from '../utilities/urls'

export function useIsNewFilePage(): boolean {
  const repo = useCurrentRepository()
  const {pullRequest} = useRoutePayload<CopilotTaskBasePayload>()
  const newFilePath = newFileUrl({
    owner: repo.ownerLogin,
    repo: repo.name,
    pullNumber: pullRequest.number,
  })

  const resolved = useResolvedPath(newFilePath)
  return !!useMatch({path: resolved.pathname, end: true})
}

export function useIsFileEditorPage(): boolean {
  const repo = useCurrentRepository()
  const {pullRequest} = useRoutePayload<CopilotTaskBasePayload>()
  const filePath = fileUrl({
    owner: repo.ownerLogin,
    repo: repo.name,
    pullNumber: pullRequest.number,
    path: '*',
  })

  const resolved = useResolvedPath(filePath)
  return !!useMatch({path: resolved.pathname, end: true})
}
