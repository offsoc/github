import {verifiedFetch} from '@github-ui/verified-fetch'
import {useState, useEffect, useRef} from 'react'
import {Autocomplete, FormControl, IconButton, Link, useSafeTimeout} from '@primer/react'
import {TrashIcon} from '@primer/octicons-react'
import {Blankslate} from '../Blankslate'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'

const DEFAULT_VALUE: string[] = []

export function RequiredDeployments({
  sourceType,
  value,
  onValueChange,
  readOnly,
  helpUrls,
}: RegisteredRuleSchemaComponent) {
  const selectedDeploymentEnvironments = (value as string[]) || DEFAULT_VALUE
  const {resolvePath} = useRelativeNavigation()
  const {safeSetTimeout} = useSafeTimeout()
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  // Required to workaround https://github.com/primer/react/issues/1971.
  const [isOverlayVisible, setOverlayVisible] = useState(false)
  const [deploymentEnvironmentFilter, setDeploymentEnvironmentFilter] = useState('')
  const [deploymentEnvironments, setDeploymentEnvironments] = useState<string[]>([])
  const [fetchingDeploymentEnvironments, setFetchingDeploymentEnvironments] = useState(false)

  const selectedDeploymentEnvironmentsById = selectedDeploymentEnvironments.reduce<Record<string, string>>(
    (map, deploymentEnvironment) => {
      map[deploymentEnvironment] = deploymentEnvironment
      return map
    },
    {},
  )

  const autocompleteItems = deploymentEnvironments
    .map(deploymentEnvironment => ({
      id: deploymentEnvironment,
      text: deploymentEnvironment,
    }))
    .filter(autocompleteItem => !selectedDeploymentEnvironmentsById[autocompleteItem.id])

  // TODO: Component typing of onSelectedChange doesn't seem to allow array values
  const onSelectedChange = (selection: unknown) => {
    if (!Array.isArray(selection)) {
      return
    }

    setDeploymentEnvironmentFilter('')

    onValueChange?.(
      selection
        .map<string>(item => {
          return item.text
        })
        .concat(selectedDeploymentEnvironments),
    )
  }

  useEffect(() => {
    async function fetchSuggestions(abortController: AbortController) {
      setDeploymentEnvironments([])

      try {
        if (!deploymentEnvironmentFilter) {
          setFetchingDeploymentEnvironments(false)
          return
        }

        setFetchingDeploymentEnvironments(true)

        const response = await verifiedFetch(
          resolvePath(
            `../deployment_environment_suggestions.json?query=${encodeURIComponent(deploymentEnvironmentFilter)}`,
          ),
          {signal: abortController.signal},
        )

        if (abortController.signal.aborted) {
          return
        }

        if (!response.ok) {
          return
        }

        setDeploymentEnvironments(await response.json())
      } finally {
        setFetchingDeploymentEnvironments(false)
      }
    }

    if (sourceType === 'organization') {
      return
    }

    abortControllerRef.current?.abort()

    const newAbortController = new AbortController()
    abortControllerRef.current = newAbortController

    setFetchingDeploymentEnvironments(true)

    const timeout = safeSetTimeout(() => {
      fetchSuggestions(newAbortController)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [deploymentEnvironmentFilter, resolvePath, safeSetTimeout, sourceType])

  return (
    <>
      {!readOnly && (
        <FormControl>
          <FormControl.Label id="deploymentEnvironmentsLabel" visuallyHidden>
            Select deployment environments
          </FormControl.Label>
          <Autocomplete>
            <Autocomplete.Input
              className="width-full"
              placeholder="Search for deployment environments"
              onChange={e => setDeploymentEnvironmentFilter(e.target.value)}
              onFocus={() => setOverlayVisible(true)}
            />
            {isOverlayVisible && deploymentEnvironmentFilter && (
              <Autocomplete.Overlay>
                <Autocomplete.Menu
                  aria-labelledby="deploymentEnvironmentsLabel"
                  emptyStateText="No deployment environments found"
                  items={autocompleteItems}
                  selectedItemIds={[]}
                  loading={fetchingDeploymentEnvironments}
                  onSelectedChange={onSelectedChange}
                />
              </Autocomplete.Overlay>
            )}
          </Autocomplete>
        </FormControl>
      )}

      {selectedDeploymentEnvironments.length ? (
        <div className="Box mt-2">
          <div className="Box-header">
            <div className="Box-title">Deployment environments that are required.</div>
          </div>
          <ul>
            {[...new Set(selectedDeploymentEnvironments)].map(deploymentEnvironment => (
              <li key={deploymentEnvironment} className="Box-row d-flex flex-justify-between flex-items-center">
                <span>{deploymentEnvironment}</span>
                <div className="d-flex flex-items-center">
                  {!readOnly && (
                    <IconButton
                      className="ml-2"
                      type="button"
                      icon={TrashIcon}
                      aria-label={`Delete ${deploymentEnvironment}}`}
                      size="small"
                      variant="invisible"
                      onClick={() =>
                        onValueChange?.(
                          selectedDeploymentEnvironments.filter(
                            selectedToDelete => selectedToDelete !== deploymentEnvironment,
                          ),
                        )
                      }
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Blankslate heading="No deployment environments have been added">
          {!readOnly && helpUrls && (
            <Link target="_blank" href={helpUrls.deploymentEnvironments}>
              Learn more about deployment environments
            </Link>
          )}
        </Blankslate>
      )}
    </>
  )
}
