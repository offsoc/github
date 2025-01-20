import {ActionList, ActionMenu, Link, TextInput} from '@primer/react'
import {type ChangeEvent, type KeyboardEvent, useCallback, useMemo, useRef, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {commitUpdateProjectItemFieldValueMutation} from '../../../mutations/update-project-item-field-value'
import type {TextFieldConfigFragment$key} from './__generated__/TextFieldConfigFragment.graphql'
import type {TextFieldFragment$key} from './__generated__/TextFieldFragment.graphql'
import {FieldWrapper} from './FieldWrapper'
import type {BaseFieldProps} from './Shared'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {isValidUrl, prefixUrl} from '../../../utils/url'
import {LinkIcon, PencilIcon} from '@primer/octicons-react'

const TextFieldFragment = graphql`
  fragment TextFieldFragment on ProjectV2ItemFieldTextValue {
    id
    text
    field {
      ...TextFieldConfigFragment
    }
  }
`

const TextFieldConfigFragment = graphql`
  fragment TextFieldConfigFragment on ProjectV2Field {
    id
    name
  }
`

type TextFieldProps = BaseFieldProps<TextFieldConfigFragment$key, TextFieldFragment$key>

export function TextField({viewerCanUpdate, itemId, projectId, field, value, onIssueUpdate}: TextFieldProps) {
  const environment = useRelayEnvironment()

  const inputRef = useRef<HTMLInputElement>(null)

  const fieldData = useFragment(TextFieldConfigFragment, field)
  const valueData = useFragment(TextFieldFragment, value)

  const fieldId = fieldData.id
  const fieldName = fieldData.name

  const [showInput, setShowInput] = useState(false)

  const [currentValue, setCurrentValue] = useState(valueData?.text ?? '')

  const commitCurrentValue = useCallback(() => {
    commitUpdateProjectItemFieldValueMutation({
      environment,
      input: {
        fieldId,
        itemId,
        projectId,
        value: {text: currentValue},
      },
      onCompleted: onIssueUpdate,
    })
  }, [environment, fieldId, itemId, projectId, currentValue, onIssueUpdate])

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter') {
        commitCurrentValue()
        setShowInput(false)
      }
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (inputRef.current) {
          setCurrentValue(valueData?.text ?? '')
          // eslint-disable-next-line github/no-blur
          inputRef.current.blur()
          setShowInput(false)
        }
      }
    },
    [commitCurrentValue, valueData?.text],
  )

  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLLIElement | null>(null)

  const linkHandler = useCallback(
    (link: string) => () => ssrSafeWindow?.open(prefixUrl(link), '_blank', 'noreferrer'),
    [],
  )
  const editHandler = useCallback(() => setShowInput(true), [setShowInput])
  const clickHandler = useCallback(() => setMenuOpen(true), [setMenuOpen])
  const linkOnKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter') {
        e.preventDefault()
        clickHandler()
      }
    },
    [clickHandler],
  )
  const linkOnClick = useCallback(
    // If the viewer can't edit we allow the default link behavior
    (e: React.MouseEvent<HTMLAnchorElement>) => viewerCanUpdate && e.preventDefault(),
    [viewerCanUpdate],
  )
  // Break the text value into fragments to build the html and actions
  const fragments = useMemo(() => currentValue.split(/(\s+)/), [currentValue])
  const [currentValueHtml, containsUrl, urls] = useMemo(() => {
    const urlList: string[] = []
    let contains = false
    const html = fragments.map((fragment, key) => {
      if (isValidUrl(prefixUrl(fragment))) {
        contains = true
        urlList.push(fragment)

        return (
          <Link
            key={`text-field-link-${key}`}
            tabIndex={0}
            href={prefixUrl(fragment)}
            onKeyDown={linkOnKeyDown}
            onClick={linkOnClick}
            target="_blank"
          >
            {fragment}
          </Link>
        )
      } else {
        return fragment
      }
    })

    return [html, contains, urlList]
  }, [fragments, linkOnClick, linkOnKeyDown])

  const anchorProps = containsUrl ? {onClick: clickHandler} : undefined
  const actionMenu = (
    <ActionMenu open={menuOpen} onOpenChange={open => setMenuOpen(open)} anchorRef={anchorRef}>
      <ActionMenu.Overlay width="small">
        <ActionList>
          <ActionList.Group>
            {urls?.map((url, index) => (
              <ActionList.Item key={index} onSelect={linkHandler(url)} role={'button'}>
                <ActionList.LeadingVisual>
                  <LinkIcon />
                </ActionList.LeadingVisual>
                {url}
              </ActionList.Item>
            ))}
            {viewerCanUpdate && (
              <ActionList.Item onSelect={editHandler} role={'button'}>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                Edit
              </ActionList.Item>
            )}
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  if (!viewerCanUpdate)
    return (
      <FieldWrapper
        showInput={showInput}
        setShowInput={setShowInput}
        placeholder={`No ${fieldName}`}
        canUpdate={false}
        value={currentValueHtml}
        name={fieldName}
      />
    )

  return (
    <>
      <FieldWrapper
        ref={anchorRef}
        value={currentValueHtml}
        anchorProps={anchorProps}
        name={fieldName}
        placeholder="Enter text…"
        inputRef={inputRef}
        showInput={showInput}
        setShowInput={setShowInput}
        onCommit={commitCurrentValue}
        input={
          <TextInput
            data-testid="text-field-input"
            ref={inputRef}
            size="small"
            sx={{fontSize: 0}}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={currentValue}
          />
        }
      />
      {actionMenu}
    </>
  )
}
