import {Box} from '@primer/react'
import type {FC} from 'react'

import useSso from './sso/hooks/useSso'
import {SingleSignOnDropdown} from './sso/SingleSignOnDropdown'
import {LABELS} from './list-view/constants'

type Props = {
  id?: string
  showSsoDropdown?: boolean
}

const NoResults: FC<Props> = ({id, showSsoDropdown = true}) => {
  const {ssoOrgs} = useSso()
  return (
    <div id={id} className="blankslate" role="region" aria-live="polite" aria-atomic="true">
      <h3 className="blankslate-heading">{LABELS.noResultsTitle}</h3>
      <p>{LABELS.noResultsDescription}</p>
      {showSsoDropdown && ssoOrgs.length > 0 && (
        <div className="blankslate-actions">
          <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
            <SingleSignOnDropdown />
          </Box>
        </div>
      )}
    </div>
  )
}

export default NoResults
