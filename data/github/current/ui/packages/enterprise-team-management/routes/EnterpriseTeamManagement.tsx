import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {TriangleDownIcon} from '@primer/octicons-react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  Checkbox,
  Flash,
  FormControl,
  Heading,
  Link,
  SelectPanel,
  Text,
  TextInput,
} from '@primer/react'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {useNavigate} from '@github-ui/use-navigate'
import type {SaveResponse} from '@github-ui/code-view-types'
import type {FormEvent} from 'react'
import {useEffect, useRef, useState} from 'react'

interface IdpGroup {
  id: string
  text: string
  member_count: number
}

interface EnterpriseTeam {
  name: string
  slug: string
  idpGroup?: IdpGroup
  syncToOrganizations: boolean
  isSecurityManager: boolean
}

export interface EnterpriseTeamManagementPayload {
  // Update this type to reflect the data you place in payload in Rails
  enterpriseSlug: string
  enterpriseTeam?: EnterpriseTeam
  idpGroups: IdpGroup[]
  idpGroupsDisabled: boolean
  enterpriseManaged: boolean
  enabledForOrganizations: boolean
  enabledForOrganizationSecurityManager: boolean
  canSyncToOrganizations: boolean
  maxSyncOrgs: number
  maxSyncMembers: number
  showEnterpriseSecurityManagerAssignmentPage: boolean
}

export function EnterpriseTeamManagement() {
  const payload = useRoutePayload<EnterpriseTeamManagementPayload>()
  const teamsURL = `/enterprises/${payload.enterpriseSlug}/teams`
  const teamNameRef = useRef<HTMLInputElement>(null)
  const canSyncToOrganizations = payload.canSyncToOrganizations ?? false
  const maxSyncMembers = payload.maxSyncMembers

  const [isSyncToOrganizations, setSyncToOrganizations] = useState(payload.enterpriseTeam?.syncToOrganizations ?? false)
  const [isSecurityManager, setSecurityManager] = useState(payload.enterpriseTeam?.isSecurityManager ?? false)

  const [selectedIdpGroup, setSelectedIdpGroup] = useState<ItemInput | undefined>(
    payload.idpGroups.find(item => item.id === payload.enterpriseTeam?.idpGroup?.id),
  )
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [flash, setFlash] = useState<SafeHTMLString>('' as SafeHTMLString)
  const [isPressed, setIsPressed] = useState(false)

  const filteredItems = payload.idpGroups.filter(item => item.text.toLowerCase().startsWith(filter.toLowerCase()))
  const editMode = payload.enterpriseTeam !== undefined
  const navigate = useNavigate()

  useEffect(() => {
    const selectedIdpGroupMemberCount =
      payload.idpGroups.find(item => item.id === selectedIdpGroup?.id)?.member_count || 0
    const teamCanSyncToOrgs = canSyncToOrganizations && selectedIdpGroupMemberCount <= maxSyncMembers

    if (!teamCanSyncToOrgs) {
      setSyncToOrganizations(false)
    }
  }, [selectedIdpGroup, canSyncToOrganizations, maxSyncMembers, payload.idpGroups])

  const flashRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    flashRef.current?.focus()
  }, [flash, flashRef])

  async function handleSubmit() {
    setIsPressed(true)

    const formData = new FormData()
    formData.append('teamName', teamNameRef.current?.value ?? '')
    formData.append('idpGroup', selectedIdpGroup?.id?.toString() ?? '')
    if (payload.enabledForOrganizations) {
      formData.append('syncToOrganizations', isSyncToOrganizations.toString())
    }
    if (payload.enabledForOrganizationSecurityManager) {
      formData.append('isSecurityManager', isSecurityManager.toString())
    }

    const url = editMode ? `${teamsURL}/${payload?.enterpriseTeam?.slug}` : teamsURL
    try {
      const result = await verifiedFetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {Accept: 'application/json'},
        body: formData,
      })

      const json: SaveResponse = await result.json()
      if (json.data.redirect) {
        const redirectUrl = json.data.redirect
        const relUrl = redirectUrl.startsWith(window.location.origin)
          ? redirectUrl.replace(window.location.origin, '')
          : redirectUrl
        navigate(relUrl)
      } else if (json.data.error) {
        setFlash(json.data.error as SafeHTMLString)
        setIsPressed(false)
      }
    } catch (error) {
      setFlash('Something went wrong!' as SafeHTMLString)
      setIsPressed(false)
    }
  }

  const selectedIdpGroupMemberCount =
    payload.idpGroups.find(item => item.id === selectedIdpGroup?.id)?.member_count || 0
  const teamCanSyncToOrgs = canSyncToOrganizations ? selectedIdpGroupMemberCount <= maxSyncMembers : false

  return (
    <>
      <Box
        as="form"
        sx={{my: 6, px: 3}}
        className="container-md px-md-4 px-lg-5"
        onSubmit={(event: FormEvent) => {
          handleSubmit()
          event.preventDefault()
        }}
      >
        {flash && (
          <Flash data-testid="flash-error" tabIndex={0} ref={flashRef} variant="danger" sx={{mb: 2}}>
            <SafeHTMLBox html={flash} />
          </Flash>
        )}

        <Box sx={{pb: 2, mb: 2, mt: 3, borderBottom: 'solid', borderBottomColor: 'border.muted', borderBottomWidth: 1}}>
          <Link href={teamsURL}>← Back to enterprise teams</Link>
          <Heading as="h1" sx={{fontSize: 4, mt: 3}}>
            {editMode ? 'Edit team' : 'Create new enterprise team'}
          </Heading>
        </Box>

        <Box sx={{mt: 3, display: 'flex'}}>
          <FormControl id="owner-input" required>
            <FormControl.Label as="span">Owner</FormControl.Label>
            <ActionMenu>
              <ActionMenu.Button disabled>{payload.enterpriseSlug}</ActionMenu.Button>
              <ActionMenu.Overlay width="medium" maxHeight="large" sx={{overflow: 'auto'}}>
                <ActionList.Group>
                  <TextInput sx={{mx: 2, display: 'flex'}} aria-label="Search owner" placeholder="Filter…" />
                </ActionList.Group>
                <ActionList.Divider />
                <ActionList.Group sx={{maxHeight: 350, overflow: 'auto'}}>
                  <ActionList>
                    <ActionList.Item>{payload.enterpriseSlug}</ActionList.Item>
                  </ActionList>
                </ActionList.Group>
              </ActionMenu.Overlay>
            </ActionMenu>
          </FormControl>
          <Text sx={{fontSize: 4, mx: 2, mt: '21px'}}>/</Text>
          <FormControl required>
            <FormControl.Label>Team name</FormControl.Label>
            <TextInput
              data-testid="team-name-input"
              ref={teamNameRef}
              aria-label="Team name"
              name="teamName"
              defaultValue={editMode ? payload.enterpriseTeam?.name : undefined}
              sx={{width: '400px'}}
            />
          </FormControl>
        </Box>
        <Text sx={{color: 'fg.muted', fontSize: 0}}>
          {editMode
            ? 'Changing the team name will break past @mentions.'
            : "You'll use this name to mention this team."}
        </Text>

        {payload.enterpriseManaged && !payload.idpGroupsDisabled && (
          <Box sx={{mt: 3}}>
            <FormControl id="idp-input">
              <FormControl.Label as="span">
                Identity Provider Group
                <br />
                <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 'normal'}}>
                  Manage team members using your identity provider group.
                </Text>
              </FormControl.Label>
              <Box sx={{my: 1}} data-testid="idp-group-select-panel">
                <SelectPanel
                  title="Select Groups"
                  subtitle="Use groups to manage team members"
                  renderAnchor={({children, 'aria-labelledby': ariaLabelledBy, ...anchorProps}) => (
                    <Button trailingAction={TriangleDownIcon} aria-labelledby={` ${ariaLabelledBy}`} {...anchorProps}>
                      {children ?? 'Select Groups'}
                    </Button>
                  )}
                  placeholderText="Filter groups"
                  open={open}
                  onOpenChange={setOpen}
                  items={filteredItems}
                  selected={selectedIdpGroup}
                  onSelectedChange={setSelectedIdpGroup}
                  onFilterChange={setFilter}
                  showItemDividers={true}
                  overlayProps={{
                    width: 'small',
                    height: 'xsmall',
                  }}
                />
              </Box>
            </FormControl>
            <Text sx={{color: 'fg.muted', fontSize: 0}}>You can manage this team&apos;s members externally</Text>
          </Box>
        )}

        {!payload.showEnterpriseSecurityManagerAssignmentPage && payload.enabledForOrganizations && (
          <div>
            <FormControl disabled={!teamCanSyncToOrgs}>
              <Checkbox
                data-testid="sync-to-organizations-input"
                checked={isSyncToOrganizations}
                onChange={() => {
                  if (teamCanSyncToOrgs) {
                    setSyncToOrganizations(!isSyncToOrganizations)
                  }
                  if (!teamCanSyncToOrgs || !isSyncToOrganizations) {
                    setSecurityManager(false)
                  }
                }}
              />
              <FormControl.Label>Make this team available in all organizations.</FormControl.Label>
            </FormControl>
            {!teamCanSyncToOrgs && (
              <Text sx={{color: 'red', fontSize: 0}}>
                Cannot sync to all organizations if Enterprise Team has more than {payload.maxSyncMembers} members or
                Business has over {payload.maxSyncOrgs} organizations
              </Text>
            )}
            {payload.enabledForOrganizationSecurityManager && (
              <div>
                <FormControl disabled={!isSyncToOrganizations}>
                  <Checkbox
                    data-testid="security-manager-input"
                    checked={isSecurityManager && isSyncToOrganizations}
                    onChange={() => {
                      setSecurityManager(!isSecurityManager)
                    }}
                  />
                  <FormControl.Label>
                    Grant the team permission to manage security alerts and settings across your enterprise. This team
                    will also be granted read access to all repositories.
                  </FormControl.Label>
                </FormControl>
              </div>
            )}
          </div>
        )}

        <Box sx={{mt: 3, display: 'flex', flexDirection: 'row'}}>
          <Button data-testid="submit-button" variant="primary" type="submit" disabled={isPressed}>
            {editMode ? 'Save changes' : 'Create team'}
          </Button>
        </Box>
      </Box>
    </>
  )
}
