import {debounce} from '@github/mini-throttle'
import type {Docset, DocsetRepo, RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {InfoIcon, RepoIcon, TrashIcon, XCircleFillIcon} from '@primer/octicons-react'
import {
  Box,
  Button,
  Flash,
  FormControl,
  Heading,
  IconButton,
  Link,
  Octicon,
  Spinner,
  Text,
  TextInput,
} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
  useRef,
  useEffect,
  type RefObject,
  useContext,
} from 'react'
import type {KnowledgeBaseOwner} from '../../routes/payloads'

import {reconstructDocsetRepos} from '../../utils/docset'
import {EditPathsDialog} from './EditPathsDialog'
import {RepoSelectionDialog, DIALOG_LABEL} from './RepoSelectionDialog'
import type CopilotChatSettingsService from '../../utils/copilot-chat-settings-service'
import {CopilotChatSettingsServiceContext} from '../../utils/copilot-chat-settings-service'
import {TopicIndexStatus, useReposIndexingState} from '@github-ui/copilot-chat/utils/copilot-chat-hooks'

export interface DocsetFormProps {
  /**
   * Handles saving a docset on the server. Returns an error message if there was an error, otherwise returns undefined
   */
  onSave: (
    docsetOwner: KnowledgeBaseOwner,
    name: string,
    description: string,
    repos: DocsetRepo[],
  ) => Promise<string | undefined>
  primaryButtonText?: string
  docsetOwner: KnowledgeBaseOwner
  initialDocset?: Docset
  initialRepos?: RepoData[]
}

interface KnowledgeBaseNameState {
  name: string
  status: 'checking' | 'error' | 'success' | undefined
  message: string | undefined
}

const defaultKnowledgeBaseNameState: KnowledgeBaseNameState = {
  name: '',
  status: undefined,
  message: undefined,
}

type StateSetter<T> = Dispatch<SetStateAction<T>>

const getInitialDocsetRepos = (
  initialDocset: Docset | undefined,
  initialRepos: RepoData[] | undefined,
): DocsetRepo[] => {
  if (!initialDocset) {
    return []
  }

  // TODO: remove this conditional statement once we fully move to sourceRepos
  if (!initialDocset.sourceRepos) {
    return reconstructDocsetRepos(initialDocset.scopingQuery, initialRepos ?? [])
  }

  return (initialRepos as DocsetRepo[]) || []
}

export function KnowledgeBaseForm({
  onSave,
  docsetOwner,
  initialDocset,
  initialRepos,
  primaryButtonText,
}: DocsetFormProps) {
  const initialFlashMessage = getInitialFlashMessage(initialDocset)
  const [flashMessage, setFlashMessage] = useState<string | null>(initialFlashMessage)
  const [knowledgeBaseName, setKnowledgeBaseName] = useState({
    ...defaultKnowledgeBaseNameState,
    name: initialDocset?.name ?? '',
  })
  const [description, setDescription] = useState(initialDocset?.description ?? '')
  const [docsetRepos, setDocsetRepos] = useState<DocsetRepo[]>(getInitialDocsetRepos(initialDocset, initialRepos))

  const [docsetReposValidationMessage, setDocsetReposValidationMessage] = useState<string | null>(null)
  const [repoSelectionDialogOpen, setRepoSelectionDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const initialReposNwo = initialRepos?.map(r => r.nameWithOwner) ?? []

  const zeroContentButton = useRef<HTMLButtonElement>(null)
  const selectRepositoryButton = useRef<HTMLButtonElement>(null)
  const initialRenderDone = useRef(false)
  const knowledgeBaseNameRef = useRef<HTMLInputElement>(null)

  const service = useContext(CopilotChatSettingsServiceContext)

  useEffect(() => {
    if (initialRenderDone.current) {
      docsetRepos.length > 0 ? selectRepositoryButton.current?.focus() : zeroContentButton.current?.focus()
    } else {
      initialRenderDone.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoSelectionDialogOpen])

  const onNameChange = (name: string) => {
    setKnowledgeBaseName(state => ({...state, name}))
    validateName(service, docsetOwner, name.trim(), initialDocset?.name, setKnowledgeBaseName)
  }

  const onSaveClick = useCallback(async () => {
    setLoading(true)
    let valid = true
    if (knowledgeBaseName.name.trim() === '') {
      setKnowledgeBaseName(state => ({...state, status: 'error', message: 'Name must not be blank'}))
      valid = false
      knowledgeBaseNameRef.current?.focus()
    }

    // When you edit a knowledge base the `knowledgeBaseName.status` is `undefined`. It is only set to something else if you modify the
    // name input. So if the `status` is `undefined` we don't need to mark this as invalid because it means the name was unchanged.
    // The conditional above will ensure there is a name set. This checks for other errors such as invalid character or if the
    // name has already been used for this organization
    if (knowledgeBaseName.status !== undefined && knowledgeBaseName.status !== 'success') {
      // No need to set a message - the name field should already have a message
      valid = false
      knowledgeBaseNameRef.current?.focus()
    }

    if (docsetRepos.length === 0) {
      setDocsetReposValidationMessage('At least one repository must be selected')
      // If valid is set to true, that means the KB name field is valid but the repo selection is not so we can focus
      // on the repo selection button
      valid && zeroContentButton.current?.focus()
      valid = false
    }

    if (!valid) {
      setLoading(false)
      return
    }

    setFlashMessage(initialFlashMessage)

    const message = await onSave(docsetOwner, knowledgeBaseName.name, description, docsetRepos)

    if (message) {
      setFlashMessage(message)
      setLoading(false)
    }
  }, [
    knowledgeBaseName.name,
    knowledgeBaseName.status,
    docsetRepos,
    docsetOwner,
    initialFlashMessage,
    onSave,
    description,
  ])

  return (
    <>
      {flashMessage && (
        <Flash variant="danger" sx={{mb: 3}}>
          {flashMessage}
        </Flash>
      )}

      <FormControl sx={{mt: 2}} required>
        <FormControl.Label required>Name</FormControl.Label>
        <TextInput
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Internal docs"
          value={knowledgeBaseName.name}
          sx={{width: '100%', maxWidth: '30rem'}}
          ref={knowledgeBaseNameRef}
        />
        {knowledgeBaseName.status === 'checking' ? (
          <FormControl.Caption>
            <span aria-live="polite">Checking availability…</span>
          </FormControl.Caption>
        ) : (
          knowledgeBaseName.status && (
            <FormControl.Validation variant={knowledgeBaseName.status} aria-live="polite">
              {knowledgeBaseName.message}
            </FormControl.Validation>
          )
        )}
      </FormControl>
      <FormControl sx={{mt: 3, flex: 1}}>
        <FormControl.Label>Description</FormControl.Label>
        <TextInput
          maxLength={1000}
          value={description}
          onChange={e => setDescription(e.target.value)}
          sx={{width: '100%'}}
        />
        <FormControl.Caption>A brief description of this knowledge base’s contents and purpose</FormControl.Caption>
      </FormControl>

      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3}}>
        <Heading as="h2" sx={{flexGrow: 1, fontWeight: 'normal', fontSize: 3}}>
          Content
        </Heading>
      </Box>
      <Text as="p" sx={{color: 'fg.muted', mt: 0}}>
        You can specify file paths within each repository for more targeted content selection.
      </Text>

      <Box
        sx={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: docsetReposValidationMessage ? 'danger.emphasis' : 'border.default',
          borderRadius: 2,
        }}
      >
        {docsetRepos.length > 0 ? (
          <ListView
            pluralUnits="repositories"
            singularUnits="repository"
            title="Repositories"
            metadata={
              <ListViewMetadata
                actionsSx={{
                  ml: 0,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pl: 2,
                }}
              >
                <Text sx={{fontWeight: 'bold'}}>
                  {docsetRepos.length} {docsetRepos.length === 1 ? 'repository' : 'repositories'}
                </Text>
                {docsetRepos.length > 0 && (
                  <Button onClick={() => setRepoSelectionDialogOpen(true)} ref={selectRepositoryButton}>
                    Add repositories
                  </Button>
                )}
              </ListViewMetadata>
            }
          >
            {docsetRepos.map(repo => (
              <RepoListViewItem
                key={repo.nameWithOwner}
                repo={repo}
                setDocsetRepos={setDocsetRepos}
                initialReposNwo={initialReposNwo}
              />
            ))}
          </ListView>
        ) : (
          <ZeroContent zeroContentButton={zeroContentButton} setRepoSelectionDialogOpen={setRepoSelectionDialogOpen} />
        )}
      </Box>
      {initialReposNwo.length > 0 && KnowledgeBaseIndexStatus(GetKnowledgeBaseIndexState(initialReposNwo))}
      {docsetReposValidationMessage && (
        <FormControl.Validation sx={{mt: 2}} variant="error" aria-live="polite">
          {docsetReposValidationMessage}
        </FormControl.Validation>
      )}

      <Box sx={{mt: 3, display: 'flex', gap: 2}}>
        <Button disabled={loading} variant="primary" onClick={onSaveClick}>
          {primaryButtonText ?? 'Save'}
        </Button>
        <Button as="a" href={`/organizations/${docsetOwner.displayLogin}/settings/copilot/chat_settings`}>
          Cancel
        </Button>
      </Box>
      <RepoSelectionDialog
        isOpen={repoSelectionDialogOpen}
        prefferedUserLogin={docsetOwner.displayLogin}
        // If this is an org we want to filter by the org name, otherwise the owner is
        // the current user and we don't want to filter by a particular org
        initialFilterText={docsetOwner.isOrganization ? `org:${docsetOwner.displayLogin} ` : ''}
        initialSelectedItems={docsetRepos}
        onClose={newSelectedRepos => {
          setDocsetReposValidationMessage('')
          setDocsetRepos(currentDocsetRepos => {
            const alreadySelected = currentDocsetRepos.filter(repo =>
              newSelectedRepos.some(newRepo => newRepo.nameWithOwner === repo.nameWithOwner),
            )
            const newlySelected = newSelectedRepos
              .filter(newRepo => currentDocsetRepos.every(repo => repo.nameWithOwner !== newRepo.nameWithOwner))
              .map(newRepo => ({...newRepo, paths: []}) as DocsetRepo)
            return [...alreadySelected, ...newlySelected]
          })
          setRepoSelectionDialogOpen(false)
        }}
      />
    </>
  )
}

/**
 * One row in the table of docset repositories
 */
function RepoListViewItem({
  repo,
  setDocsetRepos,
  initialReposNwo,
}: {
  repo: DocsetRepo
  setDocsetRepos: StateSetter<DocsetRepo[]>
  initialReposNwo?: string[]
}) {
  const onRemove = useCallback(
    (item: DocsetRepo) => {
      setDocsetRepos(items => items.filter(i => i.nameWithOwner !== item.nameWithOwner))
    },
    [setDocsetRepos],
  )
  const [editPathsDialogOpen, setEditPathsDialogOpen] = useState(false)

  return (
    <ListItem
      key={repo.name}
      sx={{py: 2}}
      title={
        <ListItemTitle value={repo.nameWithOwner} containerSx={{display: 'flex', alignItems: 'flex-start', pt: 0}} />
      }
      metadata={
        <ListItemMetadata alignment="right">
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            sx={{alignSelf: 'start'}}
            aria-label="Remove repository from knowledge base"
            icon={TrashIcon}
            variant="invisible"
            onClick={() => onRemove(repo)}
          />
        </ListItemMetadata>
      }
    >
      <ListItemLeadingContent sx={{display: 'flex-inline'}}>
        <GitHubAvatar src={repo.owner.avatarUrl} square={repo.isInOrganization} size={16} />
        {editPathsDialogOpen && <EditPathsDialog onClose={() => setEditPathsDialogOpen(false)} repo={repo} />}
      </ListItemLeadingContent>
      <ListItemMainContent>
        {repo.shortDescriptionHTML !== '' && (
          <ListItemDescription>
            <span>{repo.shortDescriptionHTML}</span>
          </ListItemDescription>
        )}
        <div>
          {repo.paths.length > 0 ? (
            <Box sx={{display: 'inline-flex', flexWrap: 'wrap', gap: 1}}>
              {repo.paths.map((path, i) => (
                <Box
                  key={i}
                  className="color-bg-subtle"
                  sx={{
                    px: 1,
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    display: 'inline-flex',
                    fontSize: 0,
                    wordBreak: 'break-word',
                  }}
                >
                  {path}
                </Box>
              ))}
            </Box>
          ) : (
            <Text sx={{display: 'inline-flex', alignItems: 'baseline'}}>
              All <code className="mx-1 p-1 color-bg-subtle rounded-2">.md</code> and{' '}
              <code className="mx-1 p-1 color-bg-subtle rounded-2">.mdx</code> files will be indexed
            </Text>
          )}
          {' · '}
          <Link
            as="button"
            inline={true}
            muted={true}
            hoverColor="fg.default"
            onClick={() => setEditPathsDialogOpen(true)}
          >
            Edit file paths
          </Link>
          {initialReposNwo &&
            initialReposNwo.indexOf(repo.nameWithOwner) !== -1 &&
            RepoIndexStatus(GetKnowledgeBaseIndexState([repo.nameWithOwner]))}
        </div>
      </ListItemMainContent>
    </ListItem>
  )
}

const ZeroContent = ({
  zeroContentButton,
  setRepoSelectionDialogOpen,
}: {
  zeroContentButton: RefObject<HTMLButtonElement>
  setRepoSelectionDialogOpen: (open: boolean) => void
}) => (
  <Blankslate>
    <Blankslate.Visual>
      <Octicon icon={RepoIcon} size={24} sx={{color: 'fg.muted'}} />
    </Blankslate.Visual>
    <Blankslate.Heading>Select repositories</Blankslate.Heading>
    <Blankslate.Description>
      Markdown files in selected repositories will be searchable using Copilot Chat.
    </Blankslate.Description>
    <Button onClick={() => setRepoSelectionDialogOpen(true)} ref={zeroContentButton}>
      {DIALOG_LABEL}
    </Button>
  </Blankslate>
)

/**
 * Returns a message if the name is invalid, otherwise returns null
 */
function isValidName(name: string): string | null {
  if (name.length === 0) {
    return 'Name is required'
  }
  if (name.length > 100) {
    return 'Name must be less than 100 characters'
  }
  if (!/^[a-z0-9- .']+$/i.test(name)) {
    return 'Name can only contain letters, numbers, periods, hyphens, apostrophes, and spaces'
  }

  return null
}

function getInitialFlashMessage(initialDocset: Docset | undefined): string | null {
  if (!initialDocset) return null

  const orgs = initialDocset.protectedOrganizations
  if (!orgs || orgs.length === 0) return null

  const orgsList = new Intl.ListFormat().format(orgs)

  return `One or more repos are hidden because you need to SSO into the ${orgsList} ${
    orgs.length === 1 ? 'organization' : 'organizations'
  }`
}

/**
 * Validates docset name and its availability
 */
async function validateNameBounced(
  service: CopilotChatSettingsService,
  docsetOwner: KnowledgeBaseOwner,
  name: string,
  initialName: string | undefined,
  setState: StateSetter<KnowledgeBaseNameState>,
) {
  if (initialName && name === initialName) {
    setState({...defaultKnowledgeBaseNameState, name})
    return
  }

  const message = isValidName(name)
  const ownerID = docsetOwner.id
  const ownerType = docsetOwner.isOrganization ? 'organization' : 'user'
  if (message) {
    setState(oldState => ({...oldState, status: 'error', message}))
    return
  }

  if (ownerType && ownerID) {
    setState(oldState => ({...oldState, status: 'checking'}))
    let available = null
    try {
      available = await service.validateKnowledgeBaseNameAvailability(docsetOwner, name)
    } catch (error) {
      setState(state => ({
        ...state,
        status: 'error',
        message: 'An error occurred',
      }))
      return
    }
    if (available) {
      setState(state => ({
        ...state,
        status: 'success',
        message: 'Available!',
      }))
    } else {
      setState(state => ({
        ...state,
        status: 'error',
        message: `The docset ${name} already exists on this account.`,
      }))
    }
  } else {
    // If owner is not selected we cannot check the availability. So remove don't set an error message.
    setState(oldState => ({...oldState, status: undefined, message: undefined}))
  }
}

const validateName = debounce(validateNameBounced, 300)

function GetKnowledgeBaseIndexState(repos: string[]): string {
  const [indexingState] = useReposIndexingState(repos, true)

  return indexingState.docs
}

function RepoIndexStatus(state: string) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', mr: 2, mt: 1}}>
      {state === TopicIndexStatus.Unindexed ? (
        <>
          <Octicon icon={XCircleFillIcon} color="danger.fg" sx={{mr: 2}} />
          <Text sx={{color: 'fg.muted', fontSize: 'small'}}>Repository not indexed</Text>
        </>
      ) : state === TopicIndexStatus.Indexing ? (
        <>
          <Spinner size="small" sx={{mr: 2}} />
          <Text sx={{color: 'fg.muted', fontSize: 'small'}}>Indexing repository</Text>
        </>
      ) : (
        <></>
      )}
    </Box>
  )
}

// Matches KnowledgeSelectPanel logic for disabling the KB from being selected
function KnowledgeBaseIndexStatus(state: string) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', mt: 3}}>
      <Octicon icon={InfoIcon} color="fg.muted" sx={{mr: 2}} />
      <Text sx={{color: 'fg.muted', fontSize: 'small'}}>
        {state === TopicIndexStatus.Indexed || state === TopicIndexStatus.Unknown
          ? 'This knowledge base is available for chat.'
          : 'This knowledge base will be available for chat once one or more repositories have been indexed.'}
      </Text>
    </Box>
  )
}
