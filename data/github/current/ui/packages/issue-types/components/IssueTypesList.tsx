import {InfoIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon, type BoxProps} from '@primer/react'
import {Blankslate} from '@primer/react/experimental'
import {useEffect, useMemo, type FC} from 'react'
import {graphql, useFragment} from 'react-relay'
import {ORGANIZATION_ISSUE_TYPES_LIMIT} from '../constants/constants'
import {Resources} from '../constants/strings'
import styles from './IssueTypesList.module.css'
import {IssueTypesListItem} from './IssueTypesListItem'
import type {IssueTypesListList$key} from './__generated__/IssueTypesListList.graphql'

type IssueTypesListProps = {
  login: string
  repositoryId?: string
  issueTypes: IssueTypesListList$key | null
  hasActions?: boolean
  setIsIssueTypesLimitReached?: (shouldDisable: boolean) => void
} & Pick<BoxProps, 'aria-label'>

/**
 * See ListView stories for a representation of this component.
 * ui/packages/list-view/src/stories/IssueTypes.stories.tsx
 * https://ui.githubapp.com/storybook/?path=/story/recipes-list-view-dotcom-pages--issue-types
 */
export const IssueTypesList: FC<IssueTypesListProps> = ({
  issueTypes,
  hasActions = true,
  login,
  repositoryId,
  setIsIssueTypesLimitReached,
  ...props
}) => {
  const data = useFragment<IssueTypesListList$key>(
    graphql`
      fragment IssueTypesListList on IssueTypeConnection {
        totalCount
        edges {
          node {
            id
            name
            ...IssueTypesListItem
          }
        }
      }
    `,
    issueTypes,
  )

  const issueTypesData = (data?.edges || []).flatMap(a => (a?.node ? a?.node : []))

  const isLimitReached = useMemo<boolean>(() => {
    if (data) {
      const {totalCount} = data
      // If totalCount is undefined or 0, return false; otherwise we check if the limit is reached
      return totalCount ? totalCount >= ORGANIZATION_ISSUE_TYPES_LIMIT : false
    }
    return false
  }, [data])

  useEffect(() => {
    setIsIssueTypesLimitReached?.(isLimitReached)
  }, [isLimitReached, setIsIssueTypesLimitReached])

  return (
    <Box as="fieldset" sx={{mt: 3}} {...props}>
      {!issueTypes || issueTypesData.length === 0 ? (
        // NOTE: disabling this here as the border prop is not used for styling

        <Blankslate border>
          <Blankslate.Heading>{Resources.blankslateHeadingOrg}</Blankslate.Heading>
          <Blankslate.Description>{Resources.blankslateBodyOrg}</Blankslate.Description>
        </Blankslate>
      ) : (
        <div className={styles.headingContainer}>
          <div>
            <h3 aria-label={Resources.ariaLabel.issueTypeListHeading} className={styles.header}>
              <div className={styles.headerText}>
                <span>{Resources.issueTypesListHeading(data?.totalCount || 0)}</span>
                <span className={styles.headerLimitText}>
                  {Resources.issueTypesListHeadingSuffix(ORGANIZATION_ISSUE_TYPES_LIMIT)}
                </span>
              </div>
            </h3>
          </div>
          {isLimitReached && (
            <div>
              <Flash sx={{borderRadius: 0, borderTop: 0, borderRight: 0, borderLeft: 0}}>
                <Octicon icon={InfoIcon} />
                {Resources.limitReachedFlashText}
              </Flash>
            </div>
          )}
          <ul>
            {issueTypesData.map(issueType => (
              <IssueTypesListItem
                issueType={issueType}
                key={`type-${issueType.id || issueType.name}`}
                hasActions={hasActions}
                owner={login}
                repositoryId={repositoryId || ''}
              />
            ))}
          </ul>
        </div>
      )}
    </Box>
  )
}
