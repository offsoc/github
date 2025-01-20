// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CheckCircleFillIcon, CircleIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, IconButton, Octicon, Text} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {SUPPORTED_VIEW_COLORS, VIEW_COLOR_BACKGROUND_MAP, VIEW_COLOR_FOREGROUND_MAP} from '../../sidebar/ColorHelper'
import {CUSTOM_VIEW_ICONS_TO_PRIMER_ICON, customViewIconToPrimerIcon} from '../../sidebar/IconHelper'
import type {IconAndColorPickerViewFragment$key} from './__generated__/IconAndColorPickerViewFragment.graphql'
import {BUTTON_LABELS} from '../../../constants/buttons'
import {LABELS} from '../../../constants/labels'
import {ERRORS} from '../../../constants/errors'
import {useQueryContext, useQueryEditContext} from '../../../contexts/QueryContext'

type Props = {
  readOnly: boolean
  currentView: IconAndColorPickerViewFragment$key
}

export function IconAndColorPicker({readOnly, currentView}: Props) {
  const {isEditing, viewTeamId} = useQueryContext()
  const relayEnvironment = useRelayEnvironment()

  const {
    color: viewColor,
    icon: viewIcon,
    id: viewId,
  } = useFragment<IconAndColorPickerViewFragment$key>(
    graphql`
      fragment IconAndColorPickerViewFragment on Shortcutable {
        icon
        color
        id
      }
    `,
    currentView,
  )

  const {dirtyViewIcon, setDirtyViewIcon, dirtyViewColor, setDirtyViewColor, commitUserViewEdit, commitTeamViewEdit} =
    useQueryEditContext()

  useEffect(() => {
    setDirtyViewIcon(viewIcon)
  }, [setDirtyViewIcon, viewIcon])

  useEffect(() => {
    setDirtyViewColor(viewColor)
  }, [setDirtyViewColor, viewColor])

  const {addToast} = useToastContext()

  // These are used to persist the state of the icon/color picker when the user clicks "Cancel".
  // This is needed to persist multiple changes while in Edit mode.
  const [viewIconOnOpen, setViewIconOnOpen] = useState(dirtyViewIcon)
  const [viewColorOnOpen, setViewColorOnOpen] = useState(dirtyViewColor)

  const onSetOpen = useCallback(
    (isOpen: boolean) => {
      setIsOpen(isOpen)
      if (isOpen) {
        setViewIconOnOpen(dirtyViewIcon)
        setViewColorOnOpen(dirtyViewColor)
      }
    },
    [dirtyViewColor, dirtyViewIcon],
  )

  const [isOpen, setIsOpen] = useState(false)

  const onSave = useCallback(() => {
    onSetOpen(false)
    if (!isEditing) {
      const args = {
        viewId,
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.updateIconAndColorError,
          })
        },
        relayEnvironment,
      }
      viewTeamId ? commitTeamViewEdit(args) : commitUserViewEdit(args)
    }
  }, [onSetOpen, isEditing, viewId, relayEnvironment, viewTeamId, commitTeamViewEdit, commitUserViewEdit, addToast])

  const onIconSelection = useCallback(
    (newIcon: string) => {
      setDirtyViewIcon(newIcon)
    },
    [setDirtyViewIcon],
  )

  const onColorSelection = useCallback(
    (newColor: string) => {
      setDirtyViewColor(newColor)
    },
    [setDirtyViewColor],
  )

  const onCancel = useCallback(() => {
    onSetOpen(false)
    setDirtyViewIcon(viewIconOnOpen)
    setDirtyViewColor(viewColorOnOpen)
  }, [onSetOpen, setDirtyViewIcon, viewIconOnOpen, setDirtyViewColor, viewColorOnOpen])

  return readOnly || !isEditing ? (
    <Box
      sx={{
        backgroundColor: VIEW_COLOR_BACKGROUND_MAP[dirtyViewColor],
        color: VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor],
        borderRadius: 2,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Octicon icon={customViewIconToPrimerIcon(viewIcon)!} />
    </Box>
  ) : (
    <AnchoredOverlay
      renderAnchor={anchorProps => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div {...anchorProps} onClick={() => onSetOpen(!isOpen)}>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            {...anchorProps}
            aria-labelledby={undefined}
            aria-label={LABELS.views.iconAndColorAnchorAriaLabel}
            icon={customViewIconToPrimerIcon(dirtyViewIcon)!}
            size="medium"
            variant="invisible"
            onClick={() => onSetOpen(!isOpen)}
            id="edit-view-icon-button"
            sx={{
              backgroundColor: VIEW_COLOR_BACKGROUND_MAP[dirtyViewColor],
              color: VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor],
            }}
          />
        </div>
      )}
      focusZoneSettings={{disabled: true}}
      focusTrapSettings={{restoreFocusOnCleanUp: true}}
      open={isOpen}
      onOpen={() => onSetOpen(true)}
      onClose={onCancel}
    >
      <Box sx={{mb: 2, mt: 2, p: 1, width: 420}}>
        <Text sx={{ml: 2, fontWeight: 'bold', color: 'fg.muted'}}>{LABELS.views.color}</Text>
        <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'start', p: 2, gap: 2}}>
          {SUPPORTED_VIEW_COLORS.map(color => (
            // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
            <IconButton
              unsafeDisableTooltip={true}
              key={color}
              icon={color === dirtyViewColor ? CheckCircleFillIcon : CircleIcon}
              aria-label={color}
              variant="invisible"
              sx={{
                '&:hover:not([aria-disabled])': {
                  backgroundColor:
                    color === dirtyViewColor ? VIEW_COLOR_FOREGROUND_MAP[color] : VIEW_COLOR_BACKGROUND_MAP[color],
                  color: color === dirtyViewColor ? 'fg.onEmphasis' : VIEW_COLOR_FOREGROUND_MAP[color],
                },
                backgroundColor: color === dirtyViewColor ? VIEW_COLOR_FOREGROUND_MAP[color] : 'transparent',
                svg: {
                  color: color === dirtyViewColor ? 'fg.onEmphasis' : VIEW_COLOR_FOREGROUND_MAP[color],
                },
              }}
              onClick={() => onColorSelection(color)}
            />
          ))}
        </Box>
        <Text sx={{ml: 2, fontWeight: 'bold', color: 'fg.muted'}}>{LABELS.views.icon}</Text>
        <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'start', pl: 2, pt: 2, gap: 2}}>
          {Object.keys(CUSTOM_VIEW_ICONS_TO_PRIMER_ICON).map(icon => (
            // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
            <IconButton
              unsafeDisableTooltip={true}
              key={icon}
              icon={customViewIconToPrimerIcon(icon)!}
              aria-label={icon}
              variant="invisible"
              sx={{
                '&:hover:not([aria-disabled])': {
                  backgroundColor: VIEW_COLOR_BACKGROUND_MAP[dirtyViewColor],
                  svg: {color: VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor]},
                },
                '&:focus:not([aria-disabled])': {
                  backgroundColor: icon === dirtyViewIcon ? VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor] : 'transparent',
                  svg: {color: icon === dirtyViewIcon ? 'fg.onEmphasis' : VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor]},
                },
                backgroundColor: icon === dirtyViewIcon ? VIEW_COLOR_FOREGROUND_MAP[dirtyViewColor] : 'transparent',
                svg: {
                  color: icon === dirtyViewIcon ? 'fg.onEmphasis' : 'fg.muted',
                },
              }}
              onClick={() => onIconSelection(icon)}
            />
          ))}
        </Box>
        <Box sx={{pr: 2, gap: 2, pt: 2, flexDirection: 'row', display: 'flex', justifyContent: 'end'}}>
          <Button onClick={onCancel}>{BUTTON_LABELS.cancel}</Button>
          <Button variant="primary" onClick={onSave}>
            {isEditing ? BUTTON_LABELS.apply : BUTTON_LABELS.save}
          </Button>
        </Box>
      </Box>
    </AnchoredOverlay>
  )
}
