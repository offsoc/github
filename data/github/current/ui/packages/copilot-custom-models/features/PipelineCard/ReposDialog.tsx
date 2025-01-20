import {Box, Heading, IconButton, Text, TextInput} from '@primer/react'
import {useMemo, useState} from 'react'
import {ListView} from '@github-ui/list-view'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {SearchIcon, XIcon} from '@primer/octicons-react'
import {Dialog} from '@primer/react/drafts'
import {useQuery} from '@tanstack/react-query'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {LanguagesWithColor} from './LanguagesWithColor'
import type {PipelineRepo} from '../../types'
import {RepoListView} from './ReposListView'
import {usePipelineDetails} from '../PipelineDetails'
import {DeletedReposBanner} from './DeletedReposBanner'
import {useDebouncedQuery} from '../../hooks/use-debounced-query'

interface Props {
  onClose: () => void
}

export function ReposDialog({onClose}: Props) {
  const {
    cardPipeline: {languages: unsortedLanguages, repoSearchPath, repositoryCount},
  } = usePipelineDetails()
  const {onTextInputChange, query, textInputValue} = useDebouncedQuery()
  const [numTotalRepos, setNumTotalRepos] = useState(0)

  const languages = useMemo(() => unsortedLanguages.sort(), [unsortedLanguages])

  const {data: repos, isLoading} = useQuery({
    queryKey: ['repo-search', repoSearchPath, query],
    queryFn: async () => {
      const queryPath = `${repoSearchPath}?q=${query}`
      const response: Response = await verifiedFetch(queryPath, {method: 'GET'})
      if (!response.ok) throw new Error(`HTTP ${response.status}${response.statusText}`)

      const payload = (await response.json()).data as PipelineRepo[]

      // Need to get the total number of repos, which only happens when there's no query
      if (!query) setNumTotalRepos(payload.length)

      return payload
    },
    staleTime: Infinity,
  })

  const repoWord = numTotalRepos === 1 ? 'repository' : 'repositories'

  const numDeletedRepos = repositoryCount - numTotalRepos

  // If the user trains on X repos then deletes all X repos, we don't want to show
  // the repo list, since it will say "No repositories matching filter" which doesn't
  // make sense. Especially when they haven't typed in any filter.
  const showRepoList = numDeletedRepos !== repositoryCount

  return (
    <Dialog
      onClose={onClose}
      renderBody={() => (
        <Dialog.Body sx={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Heading as="h5" sx={{fontSize: '14px'}}>
              Languages
            </Heading>

            <Box
              sx={{
                border: '1px solid var(--borderColor-default, var(--color-border-default))',
                borderRadius: '6px',
                px: '8px',
              }}
            >
              <ListView title="Languages" variant="compact">
                {languages.length ? (
                  <LanguagesWithColor languages={languages} />
                ) : (
                  <ListItem
                    sx={{'&:hover': {backgroundColor: 'inherit'}, fontFamily: 'var(--fontStack-monospace)'}}
                    title={<ListItemTitle value="All languages" />}
                  />
                )}
              </ListView>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Heading as="h5" sx={{fontSize: '14px'}}>
              Repositories
            </Heading>

            {numDeletedRepos > 0 && <DeletedReposBanner numDeleted={numDeletedRepos} />}

            {showRepoList && (
              <Box
                sx={{border: '1px solid var(--borderColor-default, var(--color-border-default))', borderRadius: '6px'}}
              >
                <RepoListView isLoading={isLoading} repos={repos} />
              </Box>
            )}
          </Box>
        </Dialog.Body>
      )}
      renderHeader={() => (
        <Dialog.Header>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: '6px', width: '100%'}}>
            <Box sx={{alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between'}}>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: '4px', pt: '6px', px: '8px'}}>
                <Text sx={{fontSize: '14px', fontWeight: 'semibold'}}>Training data</Text>
                <Text sx={{color: 'fg.muted', fontSize: '12px'}}>
                  {repositoryCount} {repoWord} used in your custom model
                </Text>
              </Box>
              <IconButton aria-label="Close dialog" icon={XIcon} onClick={onClose} variant="invisible" />
            </Box>
            <TextInput
              leadingVisual={SearchIcon}
              name="repo-search"
              onChange={onTextInputChange}
              placeholder="Search repositories"
              sx={{width: '100%'}}
              value={textInputValue}
            />
          </Box>
        </Dialog.Header>
      )}
    />
  )
}
