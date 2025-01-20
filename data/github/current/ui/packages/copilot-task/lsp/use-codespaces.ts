import {RemoteProvider} from '@github/codespaces-lsp'
import type {Repository} from '@github-ui/current-repository'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {CodespaceInfoBase, ConnectedCodespaceData, PullRequestData} from '../utilities/copilot-task-types'

export function useCodespaces(repo: Repository, pullRequest: PullRequestData): ConnectedCodespaceData {
  const workspaceRoot = useMemo(() => `/var/lib/docker/codespacemount/workspace/${repo.name}`, [repo.name])
  const [codespaceInfo, setCodespaceInfo] = useState<CodespaceInfoBase | null>(null)
  const [isCodespaceReady, setIsCodespaceReady] = useState(false)
  const [remoteProvider, setRemoteProvider] = useState<RemoteProvider | undefined>(undefined)
  const createPromise = useRef<Promise<Response> | null>(null)
  const createFailedCountRef = useRef(0)
  const refreshFailedCountRef = useRef(0)
  const MAX_CREATION_RETRIES = 3
  const MAX_REFRESH_RETRIES = 5

  const cloudEnvUrl = `/${repo.ownerLogin}/${repo.name}/pull/${pullRequest.number}/task/cloud_environment`

  // TODO: use the useQuery hoook for API call consistency
  const createCodespace = useCallback(async () => {
    if (createFailedCountRef.current >= MAX_CREATION_RETRIES) {
      return
    }

    if (!createPromise.current) {
      createPromise.current = reactFetchJSON(cloudEnvUrl, {body: {}, method: 'POST'})
    }

    try {
      const response = await createPromise.current
      if (!response.ok) {
        handleCreateError()
        return
      }
      const data = await response.json()
      if (!('environment_data' in data)) {
        throw new Error('Invalid codespace info')
      }

      setCodespaceInfo(data as CodespaceInfoBase)
    } catch {
      handleCreateError()
    }

    function handleCreateError() {
      createFailedCountRef.current += 1
      createPromise.current = null
    }
  }, [cloudEnvUrl])

  const refreshCodespaceInfo = useCallback(
    async (delayMs: number) => {
      if (!codespaceInfo) {
        return
      }

      delayMs = Math.max(2000, delayMs)
      try {
        const refreshedInfo = await new Promise<CodespaceInfoBase>((resolve, reject) => {
          setTimeout(async () => {
            const response = await reactFetchJSON(`${cloudEnvUrl}/${codespaceInfo.cloud_environment.guid}`, {})
            if (!response.ok) {
              reject(new Error('Failed to refresh codespace info'))
            }

            const newInfo = (await response.json()) as CodespaceInfoBase
            if (newInfo.environment_data) {
              resolve(newInfo)
            } else {
              reject(new Error('Failed to refresh codespace info. Invalid codespace info'))
            }
          }, delayMs)
        })

        setCodespaceInfo(refreshedInfo)
        refreshFailedCountRef.current = 0
      } catch (e) {
        refreshFailedCountRef.current += 1
        if (refreshFailedCountRef.current >= MAX_REFRESH_RETRIES) {
          setCodespaceInfo(null)
        }
      }
    },
    [cloudEnvUrl, codespaceInfo],
  )

  /**
   * Create codespace and wait for it to be ready
   */
  useEffect(() => {
    if (!codespaceInfo) {
      createCodespace()
      return
    }

    if (codespaceInfo.environment_data?.state === 'Failed') {
      createFailedCountRef.current += 1
      if (createFailedCountRef.current < MAX_CREATION_RETRIES) {
        setCodespaceInfo(null)
        createPromise.current = null

        createCodespace()
      }
      return
    }

    if (
      codespaceInfo.environment_data?.state !== 'Available' ||
      !codespaceInfo.environment_data?.connection?.tunnelProperties ||
      !codespaceInfo.environment_data?.connection?.sessionPath
    ) {
      refreshCodespaceInfo(2000)
      return
    }

    setIsCodespaceReady(true)
  }, [workspaceRoot, createCodespace, refreshCodespaceInfo, codespaceInfo])

  /**
   * Create remote provider when tunnel properties are available
   */
  useEffect(() => {
    if (codespaceInfo?.environment_data?.connection?.tunnelProperties) {
      setRemoteProvider(new RemoteProvider(codespaceInfo?.environment_data?.connection.tunnelProperties))
    }
  }, [codespaceInfo])

  return {
    workspaceRoot,
    isCodespaceReady,
    codespaceInfo,
    remoteProvider,
  }
}
