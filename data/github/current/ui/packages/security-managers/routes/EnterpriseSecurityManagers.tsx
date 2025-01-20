import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Heading, Pagehead, PageLayout, Text, TextInput} from '@primer/react'
import {useState} from 'react'

import {AssignmentDialog} from '../components/assignment-dialog/AssignmentDialog'
import {SecurityManagerTeamList} from '../components/team-list/SecurityManagerTeamList'

export interface EnterpriseSecurityManagersPayload {
  readonly: boolean
  canRemoveTeams: boolean
}

export function EnterpriseSecurityManagers(): JSX.Element {
  const payload = useRoutePayload<EnterpriseSecurityManagersPayload>()
  const [search, setSearch] = useState<string>('')

  const searchAndAddView = (
    <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between'}}>
      <TextInput
        data-testid="search-input"
        leadingVisual={SearchIcon}
        aria-label="Find a team search bar"
        name="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Find a team..."
        sx={{width: '30%', bg: 'canvas.subtle'}}
      />
      {!payload.readonly && <AssignmentDialog />}
    </Box>
  )

  return (
    <PageLayout sx={{padding: 'none'}}>
      <PageLayout.Header sx={{marginBottom: 3}}>
        <Pagehead className="pt-0 pb-2 mb-0">
          <Heading as="h2" data-testid="page-heading" className="f2" sx={{fontWeight: 'normal'}}>
            Security managers
          </Heading>
        </Pagehead>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        <div className="mb-3">
          <Text
            sx={{
              color: 'fg.muted',
              lineHeight: '20px',
              fontSize: '14px',
            }}
          >
            Grant a team permission to manage security alerts and settings across your organizations. The teams will
            also be granted read access to all repositories.{' '}
            {/* TODO: Uncomment this when the link is available
                <Link href="" inline>
                  Learn more about these security privileges.
                </Link>
              */}
          </Text>
        </div>

        {searchAndAddView}

        <SecurityManagerTeamList search={search} hideRemoveAction={payload.readonly || !payload.canRemoveTeams} />
      </PageLayout.Content>
    </PageLayout>
  )
}
