import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {LinkExternalIcon, RepoIcon} from '@primer/octicons-react'
import {Box, FormControl, Link, Text} from '@primer/react'
import {useEffect} from 'react'
import {useQueryLoader} from 'react-relay'

import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {WorkflowResources} from '../../../strings'
import type {searchInputIssueTypeSuggestionsQuery} from '../__generated__/searchInputIssueTypeSuggestionsQuery.graphql'
import type {searchInputLabelSuggestionsQuery} from '../__generated__/searchInputLabelSuggestionsQuery.graphql'
import type {searchInputMilestoneSuggestionsQuery} from '../__generated__/searchInputMilestoneSuggestionsQuery.graphql'
import {useGetItemsAction} from '../hooks/use-get-items-action'
import {RepositoryPicker} from '../repository-picker'
import {
  IssueTypeSuggestionsGraphqlQuery,
  LabelSuggestionsGraphqlQuery,
  MilestoneSuggestionsGraphqlQuery,
  SearchInput,
} from '../search-input'
import {AutomationBlock} from './automation-block'

interface GetItemsBlockProps {
  onNoSuggestedRepositories?: () => void
}
export const GetItemsBlock: React.FC<GetItemsBlockProps> = ({onNoSuggestedRepositories}) => {
  const {isEditing, localRepositoryId, localQuery, initialQuery} = useAutomationGraph()
  const {count, searchResultUrl, onRepositoryChange, onSearchQueryChange, repository} = useGetItemsAction()
  const repositoryOwner = repository?.nameWithOwner.split('/')[0]
  const [labelsRef, loadLabels, disposeLabels] =
    useQueryLoader<searchInputLabelSuggestionsQuery>(LabelSuggestionsGraphqlQuery)
  const [milestonesRef, loadMilestones, disposeMilestones] = useQueryLoader<searchInputMilestoneSuggestionsQuery>(
    MilestoneSuggestionsGraphqlQuery,
  )
  const [issueTypesRef, loadIssueTypes, disposeIssueTypes] = useQueryLoader<searchInputIssueTypeSuggestionsQuery>(
    IssueTypeSuggestionsGraphqlQuery,
  )

  useEffect(() => {
    if (repository && repositoryOwner) {
      loadLabels({owner: repositoryOwner, repo: repository.name}, {fetchPolicy: 'store-or-network'})
      loadMilestones({owner: repositoryOwner, repo: repository.name}, {fetchPolicy: 'store-or-network'})
      loadIssueTypes({owner: repositoryOwner, repo: repository.name}, {fetchPolicy: 'store-or-network'})
    }
    return () => {
      disposeLabels()
      disposeMilestones()
      disposeIssueTypes()
    }
  }, [
    repository,
    disposeIssueTypes,
    disposeLabels,
    disposeMilestones,
    loadIssueTypes,
    loadLabels,
    loadMilestones,
    repositoryOwner,
  ])

  return (
    <AutomationBlock
      icon={RepoIcon}
      iconBg="severe.subtle"
      iconColor="attention.fg"
      headerDescription={WorkflowResources.getItemsBlockLabel}
      {...testIdProps('get-items-block')}
    >
      <FormControl
        sx={{
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        <FormControl.Label>Filters</FormControl.Label>
        <Box
          sx={{
            display: 'flex',
            flex: 'auto',
          }}
        >
          <RepositoryPicker
            targetRepositoryId={localRepositoryId}
            sx={{alignSelf: 'start'}}
            onRepositorySelected={onRepositoryChange}
            onNoSuggestedRepositories={onNoSuggestedRepositories}
            isEditing={isEditing}
          />
          <Box sx={{ml: 2, flex: '1 1 100%'}}>
            {labelsRef && milestonesRef && issueTypesRef ? (
              <SearchInput
                labelSuggestionsQueryRef={labelsRef}
                milestoneSuggestionsQueryRef={milestonesRef}
                issueTypeSuggestionsQueryRef={issueTypesRef}
                onQueryChange={onSearchQueryChange}
                initialQuery={initialQuery}
                query={localQuery}
              />
            ) : (
              <LoadingSkeleton variant="rounded" height="32px" width="100%" />
            )}
          </Box>
        </Box>
        {isEditing && searchResultUrl && (
          <Text sx={{color: 'fg.muted', paddingTop: 3}}>
            <Link
              sx={{alignSelf: 'start'}}
              target="_blank"
              rel="noreferrer"
              href={searchResultUrl}
              {...testIdProps('search-result-link')}
            >
              {' '}
              See {count} existing items that match this query <LinkExternalIcon />
            </Link>
            <Box sx={{paddingTop: 3}}>
              {WorkflowResources.autoAddManualTip}{' '}
              <Link
                sx={{alignSelf: 'start'}}
                target="_blank"
                rel="noreferrer"
                href={
                  'https://docs.github.com/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project#adding-multiple-issues-or-pull-requests-from-a-repository'
                }
                {...testIdProps('add-multiple-link')}
                aria-label="Link to GitHub Docs page about adding multiple issues or pull requests to a project"
              >
                <LinkExternalIcon />
              </Link>
            </Box>
          </Text>
        )}
      </FormControl>
    </AutomationBlock>
  )
}
