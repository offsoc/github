import {ShieldLockIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Flash, Link, Octicon, type SxProp} from '@primer/react'
import type {Location} from 'react-router-dom'
import {useLocation} from 'react-router-dom'

export function SingleSignOnBanner({
  protectedOrgs,
  redirectURI,
  sx,
}: {
  protectedOrgs?: string[]
  redirectURI?: (location: Location) => string
} & SxProp) {
  const location = useLocation()

  if (!protectedOrgs || protectedOrgs.length === 0) {
    return null
  }

  // If there are TONS of protected orgs, render them in a combined format
  let visibleOrgNames = <b>{protectedOrgs.slice(0, 3).join(', ')}</b>

  if (protectedOrgs.length === 2) {
    visibleOrgNames = (
      <span>
        <b>{protectedOrgs[0]}</b> and <b>{protectedOrgs[1]}</b>
      </span>
    )
  }

  if (protectedOrgs.length === 3) {
    visibleOrgNames = (
      <span>
        <b>{protectedOrgs.slice(0, 2).join(', ')}</b>, and <b>{protectedOrgs[2]}</b>
      </span>
    )
  }

  return (
    <Box sx={sx} data-testid="sso-banner">
      <Box sx={{fontSize: 1}}>
        <section aria-label="Single sign on information">
          <Flash
            sx={{
              p: 3,
              borderRadius: 2,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'accent.muted',
              fontSize: 1,
            }}
          >
            {protectedOrgs.length === 1 ? (
              <div>
                <Octicon icon={ShieldLockIcon} />
                <Link
                  inline
                  href={`/orgs/${protectedOrgs[0]}/sso?return_to=${encodedRedirectURI({location, redirectURI})}`}
                >
                  Single sign-on
                </Link>
                &nbsp;to see results in the <b>{protectedOrgs[0]}</b> organization.
              </div>
            ) : (
              <Box sx={{display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 2}}>
                <Box sx={{flexGrow: 1}}>
                  <Octicon icon={ShieldLockIcon} />
                  Single sign on to see results in the {visibleOrgNames}{' '}
                  {protectedOrgs.length > 3 ? `and ${protectedOrgs.length - 3} other ` : ''}
                  {protectedOrgs.length > 1 ? 'organizations' : 'organization'}.
                </Box>
                <Box sx={{mt: [2, 2, 0]}}>
                  <SingleSignOnButton protectedOrgs={protectedOrgs} redirectURI={redirectURI} />
                </Box>
              </Box>
            )}
          </Flash>
        </section>
      </Box>
    </Box>
  )
}
function SingleSignOnButton({
  protectedOrgs,
  redirectURI,
}: {
  protectedOrgs: string[]
  redirectURI?: (location: Location) => string
}) {
  const location = useLocation()
  return (
    <ActionMenu>
      <ActionMenu.Button size="small">Select an organization</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          {protectedOrgs.map(org => (
            <ActionList.Item
              key={`org-${org}`}
              onSelect={() =>
                (window.location.href = `/orgs/${org}/sso?return_to=${encodedRedirectURI({location, redirectURI})}`)
              }
            >
              {org}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

function encodedRedirectURI({
  location,
  redirectURI,
}: {
  location: Location
  redirectURI?: (location: Location) => string
}) {
  return encodeURIComponent(redirectURI ? redirectURI(location) : location.pathname + location.search + location.hash)
}
