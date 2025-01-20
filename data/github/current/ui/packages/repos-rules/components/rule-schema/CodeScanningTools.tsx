import type {RegisteredRuleSchemaComponent, RuleSchema, SourceType, ParameterValue} from '../../types/rules-types'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {TrashIcon, PlusIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/drafts'
import {
  Button,
  IconButton,
  ActionList,
  ActionMenu,
  Box,
  FormControl,
  Link,
  Label,
  useSafeTimeout,
  SelectPanel,
} from '@primer/react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import {useState, useEffect, useRef} from 'react'

type Value = {
  [KEY in 'tool' | ThresholdField['name']]: string
}

export function CodeScanningTools(
  props: Omit<RegisteredRuleSchemaComponent, 'onValueChange'> & {onValueChange?: (value: Value[]) => void},
) {
  const {field, value, sourceType, onValueChange, helpUrls, readOnly} = props

  if (field.type !== 'array') {
    return <></>
  }

  const object = (value || field.default_value) as Value[]

  const thresholdFields = field.content_object.fields.filter(
    objectField => objectField.type === 'string' && objectField.name !== 'tool',
  ) as ThresholdField[]

  if (thresholdFields.length === 0) {
    return <></>
  }

  const grouped = object.reduce(
    (acc, item) => {
      acc[item.tool] = item
      return acc
    },
    {} as {[key: string]: Value},
  )

  const defaultValue = thresholdFields.reduce((acc, thresholdField) => {
    acc[thresholdField.name] = thresholdField.default_value
    return acc
  }, {} as Value)

  return (
    <FormControl>
      <FormControl.Label visuallyHidden={true}>{field.display_name}</FormControl.Label>
      <FormControl.Caption>
        {field.description}{' '}
        {helpUrls && (
          <Link target="_blank" href={helpUrls.codeScanning} sx={{textDecoration: 'underline'}}>
            Learn more about enabling code scanning.
          </Link>
        )}
      </FormControl.Caption>

      <div className="Box width-full">
        <div className="Box-header">
          <div className="Box-title d-flex flex-justify-between flex-items-center">
            <span className="flex-1">Required tools and alert thresholds</span>{' '}
            {!readOnly && (
              <ToolPicker
                sourceType={sourceType}
                value={object.map(item => item.tool)}
                onValueChange={newValue =>
                  onValueChange?.(
                    newValue.map(tool => ({
                      ...defaultValue,
                      ...grouped[tool],
                      tool,
                    })),
                  )
                }
              />
            )}
          </div>
        </div>
        {object.length === 0 ? (
          <Blankslate>
            <Blankslate.Heading as="h3">No code scanning tools specified</Blankslate.Heading>
            {!readOnly && helpUrls && (
              <Blankslate.Description>
                <Link target="_blank" href={helpUrls.statusChecks}>
                  Learn more about code scanning thresholds
                </Link>
              </Blankslate.Description>
            )}
          </Blankslate>
        ) : (
          <ul>
            {object.map((item, n) => (
              <Box
                as="li"
                key={n}
                data-testid={`li-${item.tool}`}
                sx={{columnGap: 1}}
                className="Box-row d-flex flex-justify-between flex-items-baseline width-full flex-wrap"
              >
                <span className="flex-1">{item.tool}</span>
                <Box sx={{columnGap: 1}} className="d-inline-flex flex-justify-between flex-items-baseline flex-wrap">
                  {thresholdFields.map(thresholdField => (
                    <ThresholdDropDown
                      key={thresholdField.name}
                      role={thresholdField.name}
                      readOnly={readOnly}
                      value={item[thresholdField.name] || thresholdField.default_value}
                      allowedOptions={thresholdField.allowed_options}
                      onValueChange={newValue => {
                        onValueChange?.(
                          object.map(threshold => {
                            return {
                              ...threshold,
                              [thresholdField.name]:
                                threshold.tool === item.tool ? newValue : threshold[thresholdField.name],
                            }
                          }),
                        )
                      }}
                      ariaLabel={thresholdField.description}
                      label={thresholdField.display_name}
                    />
                  ))}
                </Box>
                {!readOnly && (
                  <IconButton
                    className="d-inline-block"
                    data-testid="delete-tool-button"
                    icon={TrashIcon}
                    type="button"
                    aria-label={`Delete Tool`}
                    size="small"
                    variant="invisible"
                    onClick={() => onValueChange?.(object.filter(({tool}) => tool !== item.tool))}
                  />
                )}
              </Box>
            ))}
          </ul>
        )}
      </div>
    </FormControl>
  )
}

type Option = {
  display_name: string
  value: string
}

type ThresholdField = Omit<RuleSchema['parameterSchema']['fields'][0], 'allowed_options' | 'name'> & {
  allowed_options: Option[]
  name: 'alerts' | 'security_alerts'
  default_value: string
}

function decodeValue(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, value.length - 1).replaceAll('\\"', '"')
  }
  return value
}

function useSuggestions(sourceType: SourceType) {
  const {resolvePath} = useRelativeNavigation()
  const {safeSetTimeout} = useSafeTimeout()
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchSuggestions(abortController: AbortController) {
      setSuggestions([])

      try {
        setLoading(true)

        const resolvedPath =
          sourceType === 'repository'
            ? resolvePath('../../../security/code-scanning/tools.json')
            : resolvePath('../../../security/alerts/code-scanning/tool-list.json').replace(
                new RegExp('^/organizations/'),
                '/orgs/',
              )

        const statusChecksResponse = await verifiedFetchJSON(resolvedPath, {signal: abortController.signal})

        if (abortController.signal.aborted) {
          return
        }

        if (!statusChecksResponse.ok) {
          return
        }

        const data = await statusChecksResponse.json()

        setSuggestions(data.map(({value}: {value: string}) => decodeValue(value)))
      } finally {
        setLoading(false)
      }
    }

    abortControllerRef.current?.abort()

    const newAbortController = new AbortController()
    abortControllerRef.current = newAbortController

    setLoading(true)

    const timeout = safeSetTimeout(() => {
      fetchSuggestions(newAbortController)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [resolvePath, safeSetTimeout, sourceType])

  return {suggestions, loading}
}

function ThresholdDropDown({
  label,
  allowedOptions,
  readOnly,
  value,
  onValueChange,
  ariaLabel,
  role,
}: {
  label: string
  allowedOptions: Option[]
  ariaLabel: string
  readOnly: boolean | undefined
  value: string
  onValueChange: ((value: ParameterValue) => void) | undefined
  role?: string
}) {
  const selectedValue = allowedOptions.reduce(
    (acc, option) => (option.value === value ? option.display_name : acc),
    undefined as string | undefined,
  )

  return !readOnly ? (
    <ActionMenu>
      <ActionMenu.Button variant="invisible" aria-label={ariaLabel} data-testid={`${role}-button`}>
        <Box sx={{color: 'fg.muted', display: 'inline-block'}}>{label.replace(/ threshold$/, '')}:</Box>{' '}
        <span data-testid={`${role}-value`}>{selectedValue}</span>
      </ActionMenu.Button>
      <ActionMenu.Overlay align="end" width="small">
        <ActionList selectionVariant="single">
          {allowedOptions.map(option => {
            return (
              <ActionList.Item
                key={option.value}
                selected={option.value === value}
                onSelect={() => onValueChange?.(option.value)}
              >
                {option.display_name}
              </ActionList.Item>
            )
          })}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  ) : (
    <Label>
      <Box sx={{mr: 1, color: 'fg.muted', display: 'inline-block'}}>{label}:</Box>
      <span data-testid={`${role}-value`}>{selectedValue}</span>
    </Label>
  )
}

function ToolPicker({
  value,
  sourceType,
  onValueChange,
}: {
  value: string[]
  sourceType: SourceType
  onValueChange?: (value: string[]) => void
}) {
  const [text, setText] = useState('')
  const {suggestions, loading} = useSuggestions(sourceType)

  const items = [...new Set(['CodeQL', ...suggestions, ...value])].filter(item =>
    item.toLowerCase().startsWith(text.toLowerCase()),
  )

  const itemInputs: ItemInput[] = items.map(item => {
    return {text: item, id: item}
  })

  const omittedButSelected: ItemInput[] = value
    .filter(item => !items.includes(item))
    .map(item => {
      return {text: item, id: item}
    })

  if (text.length > 0 && !items.includes(text)) {
    itemInputs.push({
      text,
      id: text,
      leadingVisual: PlusIcon,
    })
  }

  const selected = itemInputs.filter(item => value.includes(item.id as string))
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SelectPanel
      loading={loading}
      title="Tool name"
      renderAnchor={({'aria-labelledby': ariaLabelledBy, ...props}) => (
        <Button
          leadingVisual={PlusIcon}
          trailingVisual={TriangleDownIcon}
          aria-haspopup="dialog"
          aria-labelledby={` ${ariaLabelledBy}`}
          {...props}
        >
          Add tool
        </Button>
      )}
      placeholderText="Enter the name of a code scanning tool"
      open={isOpen}
      onOpenChange={state => {
        setIsOpen(state)
        !state && setText('')
      }}
      items={itemInputs}
      selected={selected}
      onSelectedChange={(item: ItemInput[]) => {
        if (Array.isArray(item)) {
          const all = [...item, ...omittedButSelected]
          onValueChange?.(all.map(v => v.text).sort() as string[])
        }
      }}
      filterValue={text}
      onFilterChange={setText}
      overlayProps={{
        width: 'medium',
        height: 'xsmall',
      }}
    />
  )
}
