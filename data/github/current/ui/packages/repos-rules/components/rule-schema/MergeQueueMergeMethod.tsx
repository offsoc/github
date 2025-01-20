import {verifiedFetch} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {AlertIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, FormControl, Spinner} from '@primer/react'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'

type MergeMethod = {
  label: string
  value: string
  enabled: boolean
  disabled_reason?: string
}

async function fetchMergeMethods(
  url: string,
  abortController: AbortController,
  attempt: number = 1,
  maxAttempts: number = 3,
): Promise<{values?: MergeMethod[]; error?: string}> {
  try {
    const response = await verifiedFetch(url, {signal: abortController.signal})
    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }
    const values = await response.json()
    return {values}
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {error: 'Repository settings load was cancelled'}
    } else if (attempt <= maxAttempts) {
      await new Promise(resolve => {
        setTimeout(resolve, 100)
        abortController.signal.addEventListener('abort', resolve)
      })
      return fetchMergeMethods(url, abortController, attempt + 1, maxAttempts)
    } else {
      return {error: 'Failed to load repository settings'}
    }
  }
}

export function MergeQueueMergeMethod({field, value, onValueChange, readOnly}: RegisteredRuleSchemaComponent) {
  const [loadingValidMergeMethods, setLoadingValidMergeMethods] = useState(true)
  const [validMergeMethods, setValidMergeMethods] = useState<MergeMethod[]>([])
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const {resolvePath} = useRelativeNavigation()

  const displayValue =
    'allowed_options' in field
      ? field.allowed_options?.find(method => method.value === value)?.display_name ?? (value as string)
      : (value as string)

  useEffect(() => {
    if (readOnly) {
      return
    }

    setLoadingValidMergeMethods(true)
    setLoadError(undefined)

    const abortController = new AbortController()
    const fetchData = async () => {
      const url = resolvePath('../merge_queue_merge_methods.json')
      const {values, error} = await fetchMergeMethods(url, abortController)

      if (values) {
        setLoadError(undefined)
        setValidMergeMethods(values)
      } else {
        setLoadError(error)
        setValidMergeMethods([])
      }

      setLoadingValidMergeMethods(false)
    }

    fetchData()
    return () => abortController.abort()
  }, [readOnly, resolvePath])

  const displayName = 'Merge method'
  const description = 'Method to use when merging changes from queued pull requests.'

  if (readOnly) {
    return (
      <div>
        <span className="text-bold">{displayName}</span>
        <span> {displayValue}</span>
        <span className="d-block text-small color-fg-muted">{description}</span>
      </div>
    )
  }

  return (
    <FormControl>
      <FormControl.Label>{displayName}</FormControl.Label>
      <FormControl.Caption>{description}</FormControl.Caption>
      <ActionMenu>
        <ActionMenu.Button aria-label="Select merge method">{displayValue}</ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          {loadingValidMergeMethods ? (
            <div className="p-3">
              <Spinner size="medium" />
            </div>
          ) : loadError ? (
            <div className="p-3 color-fg-danger">
              <AlertIcon className="mr-1" />
              <span>{loadError}</span>
            </div>
          ) : (
            <ActionList selectionVariant="single" showDividers>
              {validMergeMethods.map(mergeMethod => {
                return (
                  <ActionList.Item
                    key={mergeMethod.label}
                    selected={mergeMethod.value === value}
                    onSelect={() => {
                      onValueChange?.(mergeMethod.value)
                    }}
                    disabled={!mergeMethod.enabled}
                  >
                    {mergeMethod.label}
                    {!mergeMethod.enabled && !!mergeMethod.disabled_reason && (
                      <ActionList.Description variant="block">{mergeMethod.disabled_reason}</ActionList.Description>
                    )}
                  </ActionList.Item>
                )
              })}
            </ActionList>
          )}
        </ActionMenu.Overlay>
      </ActionMenu>
    </FormControl>
  )
}
