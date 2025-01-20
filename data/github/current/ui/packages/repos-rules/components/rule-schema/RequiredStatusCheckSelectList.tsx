import {GitHubAvatar} from '@github-ui/github-avatar'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useState, useMemo, useEffect, useRef, useCallback} from 'react'
import {Link, Box, Button, IconButton, Spinner, useSafeTimeout, Octicon} from '@primer/react'
import {PlusIcon, TrashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Blankslate} from '../Blankslate'
import type {RegisteredRuleSchemaComponent, RequiredStatusChecksMetadata} from '../../types/rules-types'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import {type ExtendedItemProps, ItemPicker} from '@github-ui/item-picker/ItemPicker'
import type {ItemGroup} from '@github-ui/item-picker/shared'

type RequiredStatusCheck = {context: string; integration_id?: number}
export type StatusCheckSuggestion = {context: string; latest_integration_id?: number}
export type Integration = {
  id: number | undefined
  name: string
  preferred_avatar_url?: string
}

const DEFAULT_VALUE: RequiredStatusCheck[] = []
const DEFAULT_INTEGRATION: Integration = {id: undefined, name: 'Any source'}

function requiredStatusChecksAreEqual(a: RequiredStatusCheck, b: RequiredStatusCheck) {
  return a.context === b.context && a.integration_id === b.integration_id
}

export function RequiredStatusCheckSelectList({
  sourceType,
  value,
  onValueChange,
  readOnly,
  metadata,
  helpUrls,
}: RegisteredRuleSchemaComponent) {
  const selectedRequiredStatusChecks = (value as RequiredStatusCheck[]) || DEFAULT_VALUE
  const {resolvePath} = useRelativeNavigation()
  const {safeSetTimeout} = useSafeTimeout()
  const userAddedStatusCheckContextsRef = useRef<{[context: string]: boolean}>({})
  const abortControllerRef = useRef<AbortController | undefined>(undefined)
  const initializedIntegrationsRef = useRef(false)

  const [statusCheckFilter, setStatusCheckFilter] = useState('')
  const [statusCheckSuggestions, setStatusCheckSuggestions] = useState<StatusCheckSuggestion[]>([])
  const [fetchingStatusCheckSuggestions, setFetchingStatusCheckSuggestions] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[] | undefined>(undefined)
  const [fetchingIntegrations, setFetchingIntegrations] = useState(!readOnly)

  const title = selectedRequiredStatusChecks.length ? 'Status checks that are required' : 'No required checks'

  useEffect(() => {
    async function fetchSuggestions() {
      if (initializedIntegrationsRef.current) {
        return
      }

      initializedIntegrationsRef.current = true

      const fetchedSuggestions = [
        DEFAULT_INTEGRATION,
        ...((metadata as RequiredStatusChecksMetadata)?.integrations || []),
      ]

      if (!readOnly) {
        try {
          const path = '../integration_suggestions.json'
          const suggestionsResponse = await verifiedFetch(resolvePath(path))

          if (suggestionsResponse.ok) {
            for (const suggestion of (await suggestionsResponse.json()) as Integration[]) {
              if (fetchedSuggestions.find(existing => existing.id === suggestion.id)) {
                continue
              }

              fetchedSuggestions.push(suggestion)
            }
          }
        } finally {
          setFetchingIntegrations(false)
        }
      }

      setIntegrations(Array.from(fetchedSuggestions).sort((a, b) => a.name.localeCompare(b.name)))
    }

    fetchSuggestions()
  }, [resolvePath, metadata, readOnly])

  useEffect(() => {
    async function fetchSuggestions(abortController: AbortController) {
      setStatusCheckSuggestions([])

      try {
        if (!statusCheckFilter) {
          setFetchingStatusCheckSuggestions(false)
          return
        }

        setStatusCheckFilter(statusCheckFilter.trim())
        setFetchingStatusCheckSuggestions(true)

        const statusChecksResponse = await verifiedFetch(
          resolvePath(`../status_check_suggestions.json?query=${encodeURIComponent(statusCheckFilter)}`),
          {signal: abortController.signal},
        )

        if (abortController.signal.aborted) {
          return
        }

        if (!statusChecksResponse.ok) {
          return
        }

        setStatusCheckSuggestions(await statusChecksResponse.json())
      } finally {
        setFetchingStatusCheckSuggestions(false)
      }
    }

    if (sourceType === 'organization') {
      return
    }

    abortControllerRef.current?.abort()

    const newAbortController = new AbortController()
    abortControllerRef.current = newAbortController

    setFetchingStatusCheckSuggestions(true)

    const timeout = safeSetTimeout(() => {
      fetchSuggestions(newAbortController)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [resolvePath, safeSetTimeout, sourceType, statusCheckFilter])

  return (
    <>
      {!readOnly ? (
        <div className="Box">
          <Box className="Box-header d-flex flex-justify-between" sx={{alignItems: 'center'}}>
            <div className="Box-title">{title}</div>
            <StatusCheckPicker
              value={selectedRequiredStatusChecks}
              onValueChange={onValueChange}
              setFilter={setStatusCheckFilter}
              suggestions={statusCheckSuggestions}
              integrations={integrations}
              loading={fetchingStatusCheckSuggestions}
              statusCheckFilter={statusCheckFilter}
            />
          </Box>
          <StatusCheckRows
            selectedRequiredStatusChecks={selectedRequiredStatusChecks}
            readOnly={readOnly}
            helpUrls={helpUrls}
            fetchingIntegrations={fetchingIntegrations}
            integrations={integrations}
            onValueChange={onValueChange}
            userAddedStatusCheckContextsRef={userAddedStatusCheckContextsRef}
          />
        </div>
      ) : (
        <StatusCheckRows
          selectedRequiredStatusChecks={selectedRequiredStatusChecks}
          readOnly={readOnly}
          helpUrls={helpUrls}
          fetchingIntegrations={false}
          integrations={integrations}
          onValueChange={onValueChange}
          userAddedStatusCheckContextsRef={userAddedStatusCheckContextsRef}
        />
      )}
    </>
  )
}

function StatusCheckRows({
  selectedRequiredStatusChecks,
  readOnly,
  helpUrls,
  fetchingIntegrations,
  integrations,
  onValueChange,
  userAddedStatusCheckContextsRef,
}: {
  selectedRequiredStatusChecks: RequiredStatusCheck[]
  readOnly?: boolean
  helpUrls?: {statusChecks: string}
  fetchingIntegrations: boolean
  integrations: Integration[] | undefined
  onValueChange?: (value: RequiredStatusCheck[]) => void
  userAddedStatusCheckContextsRef: React.MutableRefObject<{[context: string]: boolean}>
}) {
  return (
    <>
      {selectedRequiredStatusChecks.length ? (
        <ul>
          {selectedRequiredStatusChecks
            .filter(
              (selected, index, array) =>
                array.findIndex(element => requiredStatusChecksAreEqual(element, selected)) === index,
            )
            .map((requiredStatusCheck, index) => (
              <li
                key={`${requiredStatusCheck.context}_${requiredStatusCheck.integration_id?.toString() || 'any'}`}
                className="Box-row d-flex flex-justify-between flex-items-center"
              >
                <span>{requiredStatusCheck.context}</span>
                <div className="d-flex flex-items-center">
                  {fetchingIntegrations ? (
                    <Spinner size="small" />
                  ) : (
                    <IntegrationPicker
                      requiredStatusCheck={requiredStatusCheck}
                      readOnly={readOnly}
                      integrations={integrations}
                      onChange={integrationId => {
                        const newSelectedRequiredStatusChecks = selectedRequiredStatusChecks.concat()
                        newSelectedRequiredStatusChecks[index] = {
                          ...newSelectedRequiredStatusChecks[index]!,
                          integration_id: integrationId,
                        }

                        onValueChange?.(newSelectedRequiredStatusChecks)
                      }}
                    />
                  )}

                  {!readOnly && (
                    <IconButton
                      className="ml-2"
                      icon={TrashIcon}
                      type="button"
                      aria-label={`Delete ${requiredStatusCheck.context}}`}
                      size="small"
                      variant="invisible"
                      onClick={() => {
                        delete userAddedStatusCheckContextsRef.current[requiredStatusCheck.context]
                        onValueChange?.(
                          selectedRequiredStatusChecks.filter(
                            selectedToDelete => !requiredStatusChecksAreEqual(selectedToDelete, requiredStatusCheck),
                          ),
                        )
                      }}
                    />
                  )}
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <Blankslate heading="No checks have been added">
          {!readOnly && helpUrls && (
            <Link target="_blank" href={helpUrls.statusChecks}>
              Learn more about status checks
            </Link>
          )}
        </Blankslate>
      )}
    </>
  )
}

const newEntryGroup: ItemGroup = {groupId: 'newEntries'}
const suggestionsGroup: ItemGroup = {groupId: 'suggestions', header: {title: 'Suggestions', variant: 'filled'}}
const alreadyAdded: ItemGroup = {groupId: 'alreadyAdded'}

function StatusCheckPicker({
  value,
  suggestions,
  integrations,
  loading,
  statusCheckFilter,
  onValueChange,
  setFilter,
}: {
  value: RequiredStatusCheck[]
  suggestions: StatusCheckSuggestion[]
  integrations?: Integration[]
  loading: boolean
  statusCheckFilter: string
  onValueChange?: (value: RequiredStatusCheck[]) => void
  setFilter: (filter: string) => void
}) {
  const changedSelection = useRef<boolean>(false)
  const tempSelections = useRef<RequiredStatusCheck[]>([])

  const newSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => !value.find(status => status.context === suggestion.context))
  }, [suggestions, value])

  const onSelectionChange = (selectionItems: RequiredStatusCheck[]) => {
    // triggered on close with or without a selection

    tempSelections.current = [] // clear the visual of selected checks list on close
    if (changedSelection.current && selectionItems.length > 0) {
      const newSel = new Set([...value, ...selectionItems])
      onValueChange?.([...newSel])
    }

    changedSelection.current = false
  }

  const groupItemId = useCallback(
    (check: RequiredStatusCheck) => {
      if (newSuggestions.length > 0 && newSuggestions.find(suggestion => suggestion.context === check.context)) {
        return suggestionsGroup.groupId
      }
      // if statusCheckFilter is not in new suggestions and not in requiredStatusChecks then put in the newEntryGroup
      if (check.context === statusCheckFilter && !value.find(status => status.context === statusCheckFilter))
        return newEntryGroup.groupId
      return alreadyAdded.groupId // if statusCheckFilter is in requiredStatusChecks then put in the alreadyAdded group
    },
    [newSuggestions, statusCheckFilter, value],
  )

  const findInCheckList = useCallback(
    (item: string, checkList: RequiredStatusCheck[]): RequiredStatusCheck | undefined => {
      return checkList.find(check => check.context === item)
    },
    [],
  )

  // converts user added status checks into item props for the underlying SelectPanel of ItemPicker
  const setCustomItemProp = useCallback(
    (variant: string, check: RequiredStatusCheck): ExtendedItemProps<RequiredStatusCheck> => {
      const itemProp: ExtendedItemProps<RequiredStatusCheck> = {
        id: '',
        source: {context: '', integration_id: undefined},
        text: '',
        groupId: '',
        leadingVisual: undefined,
        selectionVariant: undefined,
      }
      switch (variant) {
        case 'standard':
          itemProp.id = check.context
          itemProp.source = check
          itemProp.text = `Already added ${check.context}`
          itemProp.groupId = groupItemId(check)
          itemProp.disabled = true
          break
        case 'newEntry':
          itemProp.id = check.context
          itemProp.source = check
          itemProp.groupId = groupItemId(check)

          if (itemProp.groupId === suggestionsGroup.groupId) {
            itemProp.text = check.context
            itemProp.description =
              integrations?.find(integration => integration.id === check.integration_id)?.name ||
              DEFAULT_INTEGRATION.name
          } else {
            itemProp.text = `Add ${check.context}`
            itemProp.description = 'Any source'
            itemProp.leadingVisual = () => <Octicon icon={PlusIcon} />
          }

          itemProp.selectionVariant = 'multiple' // takes priority
          itemProp.onAction = (_, event) => {
            if (event.type === 'click') {
              // keeps on selection change from acting on 0 selections
              changedSelection.current = true
              // useState objects are not updated immediately (effectively frozen in time here between selections - always empty)
              // so we need to use a ref
              const selection = findInCheckList(check.context, tempSelections.current)
              if (itemProp.selected) {
                // if recordedCheck is undefined then it is being added in for the first time
                if (!selection) {
                  tempSelections.current = [...tempSelections.current, check]
                }
              } else {
                // it was selected previously and now unselected so it should be removed
                if (selection) {
                  tempSelections.current = tempSelections.current.filter(
                    tempSel => tempSel.context !== selection.context,
                  )
                }
              }
            }
          }
          break
        default:
          return itemProp
      }
      return itemProp
    },
    [groupItemId, integrations, findInCheckList],
  )

  const customConvertToItemProps = useCallback(
    (item: RequiredStatusCheck): ExtendedItemProps<RequiredStatusCheck> => {
      const check = findInCheckList(item.context, value)
      const itemProp = check ? setCustomItemProp('standard', item) : setCustomItemProp('newEntry', item)
      return itemProp
    },
    [setCustomItemProp, findInCheckList, value],
  )

  const convertFilterItem = (filterVal: string): RequiredStatusCheck[] => {
    // converts filter item into a status check to be used elsewhere
    const check: RequiredStatusCheck = {context: filterVal, integration_id: undefined}
    return [check]
  }

  const convertSuggestionItem = (suggestion: StatusCheckSuggestion): RequiredStatusCheck => {
    // converts a suggestion into a status check to be used elsewhere
    const check: RequiredStatusCheck = {context: suggestion.context, integration_id: suggestion.latest_integration_id}
    return check
  }

  const groups = useMemo((): ItemGroup[] => {
    const itemGroups = []

    const existingCheck = value.some(check => check.context === statusCheckFilter)

    // new entry if not in status checks and not in new suggestions list
    const newEntry = !existingCheck && !newSuggestions.some(suggestion => suggestion.context === statusCheckFilter)
    if (statusCheckFilter) {
      if (existingCheck) {
        itemGroups.push(alreadyAdded)
      }

      if (newEntry) {
        itemGroups.push(newEntryGroup)
      }

      if (newSuggestions.length > 0) {
        itemGroups.push(suggestionsGroup)
      }
    }
    return itemGroups
  }, [value, newSuggestions, statusCheckFilter])

  const items = useMemo((): RequiredStatusCheck[] => {
    const check = findInCheckList(statusCheckFilter, value)
    const filterInNewSuggestions = newSuggestions?.some(suggestion => suggestion.context === statusCheckFilter)
    const maxSuggestions = 10

    if (statusCheckFilter) {
      if (newSuggestions) {
        const convertedSuggestions = newSuggestions.map(convertSuggestionItem).slice(0, maxSuggestions)
        if (filterInNewSuggestions) {
          return convertedSuggestions
        } else {
          return check
            ? [check, ...convertedSuggestions] // return filter item already in the list (disabled) + new suggestions
            : [...convertedSuggestions, ...convertFilterItem(statusCheckFilter)] // or return new suggestions + filter item
        }
      } else {
        // either return the filter item already in the list or add it alongside the list
        return check ? [check] : convertFilterItem(statusCheckFilter)
      }
    } else {
      // not searching for anything so return only list of current selections, if any
      return [...tempSelections.current]
    }
  }, [findInCheckList, statusCheckFilter, value, newSuggestions])

  const renderStatusChecksAnchor = (anchorProps: React.HTMLAttributes<HTMLElement>) => {
    return (
      <Button
        trailingAction={TriangleDownIcon}
        leadingVisual={PlusIcon}
        aria-label={`Click to change required status check(s)`}
        {...anchorProps}
      >
        Add checks
      </Button>
    )
  }

  return (
    <ItemPicker
      title="Add Checks"
      items={items}
      groups={groups}
      initialSelectedItems={value}
      getItemKey={item => {
        if (findInCheckList(item.context, value)) {
          return `${item.context}:${item.integration_id || 'any'}`
        }

        if (findInCheckList(item.context, newSuggestions)) {
          return `${item.context}:${item.integration_id || 'any'}:suggestion`
        }

        return item.context
      }}
      convertToItemProps={customConvertToItemProps}
      selectionVariant={'multiple'} // fallback
      placeholderText="Search for checks"
      filterItems={setFilter}
      renderAnchor={renderStatusChecksAnchor}
      loading={loading}
      onSelectionChange={onSelectionChange}
    />
  )
}

function IntegrationPicker({
  requiredStatusCheck,
  readOnly,
  integrations,
  onChange,
}: {
  requiredStatusCheck: RequiredStatusCheck
  integrations?: Integration[]
  readOnly: RegisteredRuleSchemaComponent['readOnly']
  onChange: (id: Integration['id']) => void
}) {
  const [filter, setFilter] = useState('')
  const selectedIntegration = useMemo(() => {
    if (!requiredStatusCheck.integration_id) {
      return DEFAULT_INTEGRATION
    }

    if (!integrations) {
      return {id: requiredStatusCheck.integration_id, name: 'Unknown'}
    }

    const existingIntegration = integrations.find(integration => integration.id === requiredStatusCheck.integration_id)

    if (!existingIntegration) {
      return DEFAULT_INTEGRATION
    }

    return existingIntegration
  }, [integrations, requiredStatusCheck.integration_id])

  const filteredIntegrations = useMemo(() => {
    if (!filter) return integrations || []

    return integrations?.filter(integration => integration.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) || []
  }, [filter, integrations])

  const renderIntegrationPickerAnchor = (anchorProps: React.HTMLAttributes<HTMLElement>) => {
    const integrationEl = (
      <>
        {selectedIntegration.preferred_avatar_url && (
          <GitHubAvatar
            className="mr-2"
            alt={selectedIntegration.name}
            src={selectedIntegration.preferred_avatar_url}
          />
        )}
        {selectedIntegration.name}
      </>
    )

    if (readOnly) {
      return <span className="d-inline-flex flex-items-center">{integrationEl}</span>
    }

    return (
      <Button
        {...anchorProps}
        className="d-inline-flex flex-items-center"
        variant="invisible"
        aria-label="Click to change source"
      >
        {integrationEl}
      </Button>
    )
  }

  return (
    <ItemPicker
      getItemKey={item => item.id?.toString() || 'any'}
      items={filteredIntegrations}
      placeholderText="Select source"
      initialSelectedItems={[selectedIntegration]}
      selectionVariant="single"
      filterItems={setFilter}
      convertToItemProps={item => ({
        id: item.id,
        source: item,
        text: item.name,
        leadingVisual: item.preferred_avatar_url
          ? () => <GitHubAvatar alt={item.name} src={item.preferred_avatar_url!} />
          : undefined,
      })}
      renderAnchor={renderIntegrationPickerAnchor}
      onSelectionChange={selection => onChange(selection[0]?.id)}
    />
  )
}
