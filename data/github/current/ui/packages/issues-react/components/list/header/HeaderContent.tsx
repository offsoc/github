import {validateViewTitle} from '@github-ui/entity-validators'
import {LABELS} from '@github-ui/issue-viewer/Labels'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {IS_BROWSER} from '@github-ui/ssr-utils'
import {PencilIcon} from '@primer/octicons-react'
import {Box, FormControl, Heading, IconButton, Text, TextInput} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {AppPayload} from '../../../types/app-payload'
import type {HeaderContentCurrentViewFragment$key} from './__generated__/HeaderContentCurrentViewFragment.graphql'
import type {IconAndColorPickerViewFragment$key} from './__generated__/IconAndColorPickerViewFragment.graphql'
import {IconAndColorPicker} from './IconAndColorPicker'
import {MESSAGES} from '../../../constants/messages'
import {LABELS as HYPERLIST_LABELS} from '../../../constants/labels'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'

type HeaderContentProps = {
  readOnly?: boolean
  currentView: HeaderContentCurrentViewFragment$key & IconAndColorPickerViewFragment$key
}

export function HeaderContent({readOnly = false, currentView}: HeaderContentProps) {
  const {isCustomView, isEditing, setIsEditing} = useQueryContext()
  const {scoped_repository} = useAppPayload<AppPayload>()

  const {
    name: viewName,
    description: viewDescription,
    id: viewId,
  } = useFragment<HeaderContentCurrentViewFragment$key>(
    graphql`
      fragment HeaderContentCurrentViewFragment on Shortcutable {
        name
        description
        id
      }
    `,
    currentView,
  )

  const {dirtyTitle, setDirtyTitle, dirtyDescription, setDirtyDescription} = useQueryEditContext()

  useEffect(() => {
    setDirtyTitle(viewName)
  }, [setDirtyTitle, viewName])

  useEffect(() => {
    setDirtyDescription(viewDescription)
  }, [setDirtyDescription, viewDescription])

  const [titleValidationResult, setTitleValidationResult] = useState<string | undefined>(undefined)

  const viewTitleRef = useRef<HTMLInputElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)

  const onEdit = useCallback(() => {
    setIsEditing(true)
  }, [setIsEditing])

  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const inputTitle = e.target.value
      const inputValidationResult = validateViewTitle(inputTitle)
      setTitleValidationResult(inputValidationResult.errorMessage)
      setDirtyTitle(inputTitle)
    },
    [setDirtyTitle],
  )

  const onDescriptionChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      setDirtyDescription(e.target.value)
    },
    [setDirtyDescription],
  )

  useEffect(() => {
    if (isEditing && viewTitleRef.current && IS_BROWSER) {
      requestAnimationFrame(() => {
        if (viewTitleRef.current) {
          viewTitleRef.current.focus()
        }
      })
    }
  }, [isEditing])

  return (
    <Box sx={{width: 'auto', display: 'flex', alignItems: 'center', flex: 1}}>
      {isEditing ? (
        <Box sx={{width: '100%', display: 'flex', gap: 2, flexDirection: 'column'}}>
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
            <FormControl>
              <FormControl.Label htmlFor="edit-view-icon-button">{MESSAGES.icon}</FormControl.Label>
              {isCustomView(viewId) && <IconAndColorPicker readOnly={readOnly} currentView={currentView} />}
            </FormControl>
            <FormControl sx={{flexGrow: 1}}>
              <FormControl.Label>{MESSAGES.title}</FormControl.Label>
              <TextInput
                ref={viewTitleRef}
                onChange={onTitleChange}
                value={dirtyTitle}
                placeholder={LABELS.viewTitlePlaceholder}
                sx={{width: '100%'}}
              />
              {titleValidationResult && (
                <FormControl.Validation variant="error">{titleValidationResult}</FormControl.Validation>
              )}
            </FormControl>
          </Box>
          <FormControl sx={{flexGrow: 1}}>
            <FormControl.Label>{MESSAGES.description}</FormControl.Label>
            <TextInput
              onChange={onDescriptionChange}
              value={dirtyDescription}
              placeholder={LABELS.viewDescriptionPlaceholder}
              sx={{width: '100%'}}
            />
          </FormControl>
        </Box>
      ) : (
        <Box sx={{display: 'flex', gap: 1, flexDirection: 'column'}}>
          <Box as="span" sx={{alignItems: 'left', display: 'flex', flexDirection: 'row', gap: 2}}>
            {isCustomView(viewId) && <IconAndColorPicker readOnly={readOnly} currentView={currentView} />}
            <Heading as="h1" className={scoped_repository ? 'sr-only' : ''} sx={{fontSize: 3, wordBreak: 'break-word'}}>
              {viewName}
            </Heading>
            {isCustomView(viewId) && !readOnly && (
              // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
              <IconButton
                unsafeDisableTooltip={true}
                icon={PencilIcon}
                variant="invisible"
                ref={editButtonRef}
                aria-label={HYPERLIST_LABELS.views.editViewAriaLabel(viewName)}
                onClick={onEdit}
                sx={{color: 'fg.muted'}}
              />
            )}
          </Box>
          {viewDescription && <Text sx={{fontSize: 14, mr: 2, color: 'fg.muted'}}>{viewDescription}</Text>}
        </Box>
      )}
    </Box>
  )
}
