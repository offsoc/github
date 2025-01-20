import {XIcon} from '@primer/octicons-react'
import {Box, IconButton} from '@primer/react'

import type {CommentAuthor, DiffAnnotation, MarkerNavigationImplementation} from '../types'
import {Annotation} from './Annotation'
import {GlobalMarkerNavigation} from './GlobalMarkerNavigation'

export type AnnotationDialogProps = {
  annotation: DiffAnnotation
  markerNavigationImplementation: MarkerNavigationImplementation
  onClose: () => void
  ghostUser?: CommentAuthor
}

/**
 * Show annotation in a dialog
 */
export function AnnotationDialog({
  annotation,
  markerNavigationImplementation,
  onClose,
  ghostUser,
}: AnnotationDialogProps) {
  return (
    <Box sx={{width: 'clamp(240px, 100vw, 540px)'}}>
      <Box
        sx={{
          borderBottom: '1px solid',
          borderBottomColor: 'border.default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          background: 'canvas.default',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center'}}>
          <GlobalMarkerNavigation
            markerId={annotation.id}
            markerNavigationImplementation={markerNavigationImplementation}
            onNavigate={onClose}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'right',
              flexGrow: 1,
            }}
          >
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              aria-label="Close annotation"
              icon={XIcon}
              variant="invisible"
              onClick={onClose}
            />
          </Box>
        </Box>
      </Box>
      <Annotation annotation={annotation} ghostUser={ghostUser} />
    </Box>
  )
}
