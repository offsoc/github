import {testIdProps} from '@github-ui/test-id-props'
import {GlobeIcon, LockIcon, PencilIcon, ProjectTemplateIcon} from '@primer/octicons-react'
import {Box, IconButton, Label, Link, Octicon} from '@primer/react'
import type {SpaceProps, TypographyProps} from 'styled-system'

import {getInitialState} from '../../helpers/initial-state'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useNavigate} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_SETTINGS_ROUTE} from '../../routes'
import {useProjectDetails} from '../../state-providers/memex/use-project-details'
import {useProjectState} from '../../state-providers/memex/use-project-state'
import {useMemexServiceQuery} from '../../state-providers/memex-service/use-memex-service-query'
import {SanitizedHtml} from '../dom/sanitized-html'
import {PROJECT_NAME_INPUT_ID} from '../shared-ids'

export const MemexTitle: React.FC<TypographyProps & SpaceProps> = () => {
  const {memex_table_without_limits} = useEnabledFeatures()
  const {hasWritePermissions} = ViewerPrivileges()
  const {shortDescriptionHtml, titleHtml} = useProjectDetails()
  const {isPublicProject, isClosed, isTemplate} = useProjectState()
  const navigate = useNavigate()
  const visibility = isPublicProject ? 'Public' : 'Private'
  const projectRouteParams = useProjectRouteParams()
  const {data: memexServiceData} = useMemexServiceQuery()

  const onEditClick = () => {
    navigate(PROJECT_SETTINGS_ROUTE.generatePath(projectRouteParams))
    setTimeout(() => document.getElementById(PROJECT_NAME_INPUT_ID)?.focus())
  }

  const mwlKillSwitchEnabled = memexServiceData?.killSwitchEnabled
  const showMwlBetaIndicator = memex_table_without_limits || mwlKillSwitchEnabled

  const projectIcon = () => {
    if (isPublicProject && isTemplate) {
      return ProjectTemplateIcon
    }

    if (!isPublicProject) {
      return LockIcon
    }

    return GlobeIcon
  }

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          minWidth: 0,
          gap: 1,
          pr: 2,
          cursor: 'default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            '&:not(:focus-within):not(:hover) > #edit-project-name-button': {
              clipPath: 'circle(0)',
              // Hide empty space from hidden button when template tokens are adjacent to title
              width: isTemplate ? 0 : 'auto',
            },
            cursor: hasWritePermissions ? 'pointer' : 'default',
          }}
          // normally an onClick handler on a Box with no role would be inaccessible, but we're also providing the edit
          // button as a focusable child so all this is doing is expanding the clickable area for the button.
          onClick={hasWritePermissions ? onEditClick : undefined}
        >
          {isClosed ? <ClosedLabel /> : null}

          <Octicon icon={projectIcon()} sx={{color: 'fg.muted'}} />

          <SanitizedHtml
            as="h1"
            sx={{
              fontSize: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              my: 0,
            }}
          >
            {titleHtml}
          </SanitizedHtml>
          {hasWritePermissions && (
            <IconButton
              id="edit-project-name-button"
              icon={PencilIcon}
              variant="invisible"
              size="small"
              onClick={onEditClick}
              aria-label="Edit project name"
              sx={{color: 'fg.default'}}
            />
          )}
        </Box>

        {showMwlBetaIndicator && (
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Label variant="success" data-testid="memex_without_limits_beta_label" tabIndex={0}>
              Increased items beta
            </Label>
            <Link sx={{paddingLeft: 2, fontSize: 0}} href={getInitialState().pwlBetaFeedbackLink}>
              Feedback
            </Link>
          </Box>
        )}

        {isTemplate ? <Label variant="secondary"> {visibility} template </Label> : null}
      </Box>
      {isTemplate && (
        <div>
          <SanitizedHtml as="div" className="color-fg-muted">
            {shortDescriptionHtml}
          </SanitizedHtml>
        </div>
      )}
    </div>
  )
}

const ClosedLabel = () => (
  <Label
    variant="done"
    {...testIdProps('closed-project-label')}
    sx={{color: 'fg.onEmphasis', backgroundColor: 'done.emphasis'}}
  >
    Closed
  </Label>
)
