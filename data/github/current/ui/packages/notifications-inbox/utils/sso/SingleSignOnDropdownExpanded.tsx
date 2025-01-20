import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {ShieldLockIcon} from '@primer/octicons-react'
import {ActionMenu, Box, type BoxProps, Link, Octicon, Text} from '@primer/react'
import {type FC, useMemo} from 'react'

import useSso from './hooks/useSso'
import SingleSignOnDropdownMenu from './SingleSignOnDropdownMenu'
import {ssoUrl} from './utils/urls'

type Props = BoxProps

export const SingleSignOnDropdownExpanded: FC<Props> = ({sx = {}}) => {
  const {ssoOrgs} = useSso()

  const windowLocation = useMemo(
    () => encodeURIComponent(ssrSafeWindow === undefined ? '' : ssrSafeWindow.location.href),
    [],
  )

  if (ssoOrgs.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'border.muted',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 2,
        ...sx,
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2}}>
        <Text sx={{color: 'fg.muted', fontSize: 0}}>
          {ssoOrgs.length === 1 ? (
            <Link href={ssoUrl(ssoOrgs[0]!.login!, windowLocation)}>Single sign-on </Link>
          ) : (
            'Single sign-on'
          )}{' '}
          to see items
          {ssoOrgs.length === 1
            ? ` from the ${ssoOrgs[0]!.login} organization`
            : ` from ${ssoOrgs.length} organizations`}
        </Text>
        <Octicon icon={ShieldLockIcon} sx={{color: 'fg.muted'}} />
      </Box>
      {ssoOrgs.length > 1 && (
        <ActionMenu>
          <ActionMenu.Button size="small">Select an organization</ActionMenu.Button>
          <SingleSignOnDropdownMenu />
        </ActionMenu>
      )}
    </Box>
  )
}
