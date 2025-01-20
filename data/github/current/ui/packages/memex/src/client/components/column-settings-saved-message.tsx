import {testIdProps} from '@github-ui/test-id-props'
import {Link, Text} from '@primer/react'
import {useContext} from 'react'

import {ViewContext} from '../hooks/use-views'
import {Link as RouterLink} from '../router'
import {useProjectDetails} from '../state-providers/memex/use-project-details'

/**
 * Message to show on column settings page when the user succesfully saves changes.
 */
export function ColumnSettingsSavedMessage() {
  const {title} = useProjectDetails()
  const viewContext = useContext(ViewContext)

  // Normally ViewContext will be provided, but it's not available in unit test environment
  return (
    <Text sx={{ml: 2}} {...testIdProps('column-settings-saved-message')}>
      Changes saved. Return to{' '}
      {viewContext ? (
        <Link
          as={RouterLink}
          to={viewContext.returnToViewLinkTo}
          style={{cursor: 'pointer'}}
          tabIndex={0}
          {...testIdProps('return-to-project-link')}
        >
          {title}
        </Link>
      ) : (
        title
      )}
      .
    </Text>
  )
}
