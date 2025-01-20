import {testIdProps} from '@github-ui/test-id-props'
import {CheckIcon, GlobeIcon, LockIcon, OrganizationIcon, StopIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button, Heading, Link, Octicon, Text} from '@primer/react'
import {useEffect, useRef} from 'react'

import {Role} from '../../../../api/common-contracts'
import {getInitialState} from '../../../../helpers/initial-state'
import {fetchJSONIslandData} from '../../../../helpers/json-island'
import {toTitleCase} from '../../../../helpers/util'
import {
  useOrganizationAccessRole,
  useUpdateOrganizationAccessRoleOptimistically,
} from '../../../../queries/organization-access'
import {Link as RouterLink} from '../../../../router'
import {useProjectRouteParams} from '../../../../router/use-project-route-params'
import {PROJECT_SETTINGS_ROUTE} from '../../../../routes'
import {useProjectState} from '../../../../state-providers/memex/use-project-state'
import {ManageAccessResources} from '../../../../strings'
import {CollaboratorRoleDropDown, defaultCollaboratorRoleDropDownRoles} from './collaborator-role-drop-down'

export const PrivacySettings: React.FC = () => {
  const {isPublicProject} = useProjectState()
  const {projectOwner, isOrganization} = getInitialState()
  const owner = projectOwner?.name?.toLowerCase()
  const {
    data: organizationAccessRole = Role.None,
    error,
    refetch: refetchOrganizationAccessRole,
    status: orgAccessRoleRequestStatus,
  } = useOrganizationAccessRole()
  const {mutate: updateOrganizationAccessRole, status: orgAccessRequestUpdateState} =
    useUpdateOrganizationAccessRoleOptimistically()

  const firstFocusElementRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    firstFocusElementRef.current?.focus()
  }, [])

  const projectRouteParams = useProjectRouteParams()
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap'}} {...testIdProps('privacy-settings')}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'canvas.subtle',
          borderRadius: 2,
          flex: 1,
          p: 3,
          mr: isOrganization ? 2 : 0,
        }}
        {...testIdProps('privacy-settings-manage-visibility')}
      >
        <Box sx={{mb: 3}}>
          <Box sx={{mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Heading as="h2" sx={{mr: 2, fontSize: 2, fontWeight: 'semibold'}}>
              {isPublicProject ? 'Public project' : 'Private project'}
            </Heading>
            <Octicon icon={isPublicProject ? GlobeIcon : LockIcon} sx={{color: 'fg.muted'}} />
          </Box>
          <Text sx={{color: 'fg.muted'}}>
            {isPublicProject
              ? 'This project is public and visible to anyone.'
              : 'Only those with access to this project can view it.'}
          </Text>
        </Box>
        <div>
          <Button
            ref={firstFocusElementRef}
            as={RouterLink}
            to={PROJECT_SETTINGS_ROUTE.generatePath(projectRouteParams)}
            {...testIdProps('privacy-settings-manage-access-link')}
          >
            Manage
          </Button>
        </div>
      </Box>

      {isOrganization && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'canvas.subtle',
            borderRadius: 2,
            flex: 1,
            padding: 3,
          }}
          {...testIdProps('privacy-settings-organization-access')}
        >
          <Box sx={{mb: 3}}>
            <Box sx={{mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Heading as="h2" sx={{mr: 2, fontSize: 2, fontWeight: 'semibold'}}>
                Base role
              </Heading>
              <Octicon icon={OrganizationIcon} sx={{color: 'fg.muted'}} />
            </Box>
            <SelectedRoleText owner={owner} organizationAccessRole={organizationAccessRole} />
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {error ? (
              <Button disabled trailingVisual={TriangleDownIcon} {...testIdProps('collaborators-role-dropdown-button')}>
                {toTitleCase(organizationAccessRole)}
              </Button>
            ) : (
              <OrgAccessDropdown
                organizationAccessRole={organizationAccessRole}
                updateOrganizationAccessRole={updateOrganizationAccessRole}
              />
            )}
            <div aria-live="polite" {...testIdProps('org-access-update-status')}>
              <Status
                orgAccessRoleRequestStatus={orgAccessRoleRequestStatus}
                orgAccessRequestUpdateState={orgAccessRequestUpdateState}
                refetchOrganizationAccessRole={refetchOrganizationAccessRole}
              />
            </div>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function SelectedRoleText({owner, organizationAccessRole}: {owner?: string; organizationAccessRole: Role}) {
  if (organizationAccessRole === Role.Admin) {
    return <Text sx={{color: 'fg.muted'}}>{ManageAccessResources.privacySettingsAdmin}</Text>
  }

  const base_url = fetchJSONIslandData('github-url')
  const ownerUrl = `${base_url}/orgs/${owner}/people?query=role%3Aowner`
  const ownerUrlTestId = 'privacy-settings-org-owners-link'

  if (organizationAccessRole === Role.Write) {
    return (
      <Text sx={{color: 'fg.muted'}}>
        Everyone in the organization can see and edit this project.
        <Link
          inline
          rel="noopener noreferrer"
          target="_blank"
          href={ownerUrl}
          sx={{mx: 1}}
          underline
          {...testIdProps(ownerUrlTestId)}
        >
          Owners
        </Link>
        are admins of this project.
      </Text>
    )
  } else if (organizationAccessRole === Role.Read) {
    return (
      <Text sx={{color: 'fg.muted'}}>
        Everyone in the organization can see this project.
        <Link
          inline
          rel="noopener noreferrer"
          target="_blank"
          href={ownerUrl}
          sx={{mx: 1}}
          underline
          {...testIdProps(ownerUrlTestId)}
        >
          Owners
        </Link>
        are admins of this project.
      </Text>
    )
  } else {
    return (
      <Text sx={{color: 'fg.muted'}}>
        Only those with direct access and{' '}
        <Link
          inline
          rel="noopener noreferrer"
          target="_blank"
          href={ownerUrl}
          sx={{mr: 1}}
          {...testIdProps(ownerUrlTestId)}
        >
          owners
        </Link>
        can see this project. Owners are also admins of this project.
      </Text>
    )
  }
}

function Status({
  orgAccessRoleRequestStatus,
  orgAccessRequestUpdateState,
  refetchOrganizationAccessRole,
}: {
  orgAccessRoleRequestStatus: 'error' | 'success' | 'pending'
  orgAccessRequestUpdateState: 'error' | 'success' | 'pending' | 'idle'
  refetchOrganizationAccessRole: () => void
}) {
  if (orgAccessRequestUpdateState === 'error' || orgAccessRoleRequestStatus === 'error') {
    return (
      <Box {...testIdProps('initial-org-access-request-failure-message')} sx={{ml: 2}}>
        <Octicon icon={StopIcon} sx={{mr: 1, color: 'danger.fg'}} />
        <span>Something went wrong.</span>{' '}
        <Link as="button" onClick={() => refetchOrganizationAccessRole()}>
          Try again
        </Link>
      </Box>
    )
  } else if (orgAccessRequestUpdateState === 'success') {
    return (
      <Box {...testIdProps('org-access-request-success-message')} sx={{ml: 2}}>
        <Octicon icon={CheckIcon} sx={{mr: 1, color: 'success.fg'}} />
        <span>Changes saved</span>
      </Box>
    )
  }
  return null
}

function OrgAccessDropdown({
  organizationAccessRole,
  updateOrganizationAccessRole,
}: {
  organizationAccessRole: Role
  updateOrganizationAccessRole: (args: {role: Role}) => void
}) {
  return (
    <CollaboratorRoleDropDown
      align="inside-left"
      roles={[
        ...defaultCollaboratorRoleDropDownRoles,
        {
          value: Role.None,
          displayName: toTitleCase(Role.None.toString()),
          description: ManageAccessResources.collaboratorDropDownNone,
        },
      ]}
      isOrganizationRole
      selectedRoles={[organizationAccessRole]}
      handleOnClick={role => {
        if (role === organizationAccessRole) return
        updateOrganizationAccessRole({role})
      }}
    />
  )
}
