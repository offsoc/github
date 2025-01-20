import {TopicIndexStatus, useReposIndexingState} from '@github-ui/copilot-chat/utils/copilot-chat-hooks'
import type {Docset} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {BookIcon, CheckIcon, PencilIcon, SkipFillIcon, TrashIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Heading, IconButton, Octicon, Pagehead, Spinner, Text, Truncate} from '@primer/react'
import {Blankslate, Dialog} from '@primer/react/drafts'
import {useContext, useEffect, useState} from 'react'
import {KnowledgeBaseFormProviders} from '../components/docs/KnowledgeBaseFormProviders'
import {CopilotChatSettingsServiceContext} from '../utils/copilot-chat-settings-service'

export interface ChatSettingsPayload {
  newKnowledgeBasePath: string
  currentOrganizationLogin: string
}

export function ChatSettings() {
  const payload = useRoutePayload<ChatSettingsPayload>()
  const truncationWidths = ['220px', '300px', null, '500px', '600px']
  const [knowledgeBases, setKnowledgeBases] = useState<Docset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hadError, setHadError] = useState(false)
  const service = useContext(CopilotChatSettingsServiceContext)

  useEffect(() => {
    let ignore = false

    const fetch = async () => {
      try {
        const kbs = await service.fetchKnowledgeBases(payload.currentOrganizationLogin)

        setKnowledgeBases(kbs)
      } catch (e) {
        setHadError(true)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    setIsLoading(true)
    fetch()

    return () => {
      ignore = true
    }
  }, [payload.currentOrganizationLogin, service])

  return (
    <KnowledgeBaseFormProviders>
      <Pagehead sx={{mt: 0, pt: 0, pb: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Heading as="h1" sx={{fontWeight: 'normal', fontSize: 4}}>
            Knowledge bases
          </Heading>
          {knowledgeBases.length > 0 && (
            <Button as="a" href={payload.newKnowledgeBasePath} variant="primary">
              New knowledge base
            </Button>
          )}
        </Box>
      </Pagehead>

      <Text as="p" sx={{mb: 4}}>
        Knowledge bases are groups of repositories that are used by Copilot to ground responses in your organization’s
        data. When chatting with Copilot on GitHub.com, members of your organization may choose which knowledge base
        should be used to answer their questions.
      </Text>

      <KnowledgeBaseActionBanner />

      {isLoading ? (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Spinner />
        </Box>
      ) : hadError ? (
        <Flash variant="danger">Failed to load knowledge bases.</Flash>
      ) : knowledgeBases.length > 0 ? (
        <>
          <KnowledgeBaseList />
          <Text as="p" sx={{mt: 2, color: 'fg.muted'}}>
            Knowledge bases are automatically reindexed when changes are pushed or merged to a repository&apos;s default
            branch.
          </Text>
        </>
      ) : (
        // @ts-expect-error Valid CSS but the types don't account for it yet: [text-wrap: balance](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)
        <Box sx={{mt: 3, '& p': {textAlign: 'center', textWrap: 'balance'}}}>
          <Blankslate border={true}>
            <Blankslate.Visual>
              <Octicon icon={BookIcon} size={24} sx={{color: 'fg.muted'}} />
            </Blankslate.Visual>
            <Blankslate.Heading>No knowledge bases</Blankslate.Heading>
            <Blankslate.Description>
              Create a knowledge base to enable your team to get quick and relevant answers from your organization’s
              Markdown documentation.
            </Blankslate.Description>
            <Blankslate.PrimaryAction href={payload.newKnowledgeBasePath}>New knowledge base</Blankslate.PrimaryAction>
          </Blankslate>
        </Box>
      )}
    </KnowledgeBaseFormProviders>
  )

  function KnowledgeBaseList() {
    function getRepositoriesCount(knowledgeBase: Docset): string {
      if (knowledgeBase.sourceRepos) {
        return `${knowledgeBase.sourceRepos.length} ${
          knowledgeBase.sourceRepos.length === 1 ? 'repository' : 'repositories'
        }`
      }
      // TODO: remove this return statement once we fully move to sourceRepos
      return `${knowledgeBase.repos.length} ${knowledgeBase.repos.length === 1 ? 'repository' : 'repositories'}`
    }

    function GetKnowledgeBaseIndexState(repos: string[]): string {
      const [indexingState] = useReposIndexingState(repos, true, true)

      return indexingState.docs
    }

    return (
      <>
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'border.default',
            borderRadius: 6,
          }}
        >
          {knowledgeBases.map((knowledgeBase: Docset) => (
            <Box
              key={knowledgeBase.id}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'border.default',
                p: 3,
                ':last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box sx={{pr: 3, display: 'flex', flexDirection: 'column'}}>
                <Heading as="h2" sx={{fontSize: 2, mb: 0}}>
                  <Truncate inline title={knowledgeBase.name} sx={{maxWidth: truncationWidths}}>
                    {knowledgeBase.name}
                  </Truncate>
                </Heading>
                <Text sx={{fontSize: 1, mt: 0, color: 'fg.muted', display: 'inline-flex'}}>
                  {KnowledgeBaseIndexStatus(GetKnowledgeBaseIndexState(knowledgeBase.repos))}
                  {getRepositoriesCount(knowledgeBase)}
                  {knowledgeBase.description && (
                    <Truncate inline title={knowledgeBase.description} sx={{maxWidth: truncationWidths}}>
                      &nbsp;
                      {`• ${knowledgeBase.description}`}
                    </Truncate>
                  )}
                </Text>
              </Box>
              <Box sx={{display: 'flex'}}>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  as="a"
                  href={`/organizations/${payload.currentOrganizationLogin}/settings/copilot/chat_settings/${knowledgeBase.id}/edit`}
                  aria-label={`Edit '${knowledgeBase.name}'`}
                  variant="invisible"
                  icon={PencilIcon}
                />
                <DeleteKnowledgeBaseButton knowledgeBase={knowledgeBase} />
              </Box>
            </Box>
          ))}
        </Box>
      </>
    )
  }

  function DeleteKnowledgeBaseButton({knowledgeBase}: {knowledgeBase: Docset}) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [hasDeleteError, setHadDeleteError] = useState(false)
    const onDelete = async () => {
      try {
        await service.deleteKnowledgeBase(payload.currentOrganizationLogin, knowledgeBase)
      } catch (e) {
        setHadDeleteError(true)
      }

      setKnowledgeBases((prevKnowledgeBases: Docset[]) => prevKnowledgeBases.filter(kb => kb.id !== knowledgeBase.id))
      setShowDeleteConfirmation(false)
      // KnowledgeBaseActionBanner() uses the url to determine if a KB was created or updated. Deleting
      // a KB does not trigger a redirect so in order to make KnowledgeBaseActionBanner() easily reusable
      // we can just append the delete action param and KnowledgeBaseActionBanner() will handle the banner for it
      // We should also clear any existing action values before appending
      const url = new URL(location.href, window.location.origin)
      url.searchParams.delete('action')
      url.searchParams.append('action', 'deleted')
      history.replaceState(history.state, '', url.toString())
    }
    return (
      <div>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          aria-label="Delete knowledge base"
          icon={TrashIcon}
          onClick={() => setShowDeleteConfirmation(true)}
          variant="invisible"
        />
        {showDeleteConfirmation && (
          <Dialog
            footerButtons={[
              {buttonType: 'normal', content: 'Cancel', onClick: () => setShowDeleteConfirmation(false)},
              {buttonType: 'danger', content: 'Delete', onClick: () => void onDelete()},
            ]}
            onClose={() => setShowDeleteConfirmation(false)}
            renderBody={() => (
              <Dialog.Body sx={{}}>
                {hasDeleteError && (
                  <Flash sx={{mb: 2}} variant="danger">
                    Failed to delete knowledge base.
                  </Flash>
                )}
                You are about to delete the <strong>{knowledgeBase.name}</strong> knowledge base.
              </Dialog.Body>
            )}
            title="Confirm deletion"
          />
        )}
      </div>
    )
  }

  function KnowledgeBaseActionBanner() {
    const [isHidden, setIsHidden] = useState(false)
    const search = ssrSafeLocation.search && new URLSearchParams(ssrSafeLocation.search)

    if (isHidden || !search) return null
    const action = search.get('action')
    if (!action || !['created', 'updated', 'deleted'].includes(action)) return null
    const flashMessage = `Knowledge base ${action}. ${
      action === 'created' || action === 'updated' ? 'Repositories may need to be indexed.' : ''
    }`

    return (
      <Flash
        variant={action === 'created' ? 'success' : 'default'}
        sx={{
          alignItems: 'center',
          display: 'flex',
          width: '100%',
          mb: 3,
        }}
      >
        {action === 'created' && <CheckIcon />}
        <Text aria-live="polite" sx={{flexGrow: 1}}>
          {flashMessage}
        </Text>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          aria-label="Dismiss banner"
          icon={XIcon}
          variant="invisible"
          sx={{'> svg': {margin: 0}}}
          onClick={() => {
            // Determine what action parameter is provided in the url (eg. ?action=created)
            const url = new URL(location.href, window.location.origin)
            url.searchParams.delete('action')
            history.replaceState(history.state, '', url.toString())
            setIsHidden(true)
          }}
        />
      </Flash>
    )
  }
}

function KnowledgeBaseIndexStatus(state: string) {
  return (
    <Box sx={{alignItems: 'center', display: 'flex'}}>
      {state === TopicIndexStatus.Indexing ? (
        <>
          <Octicon icon={SkipFillIcon} color="success.fg" sx={{mr: 2}} />
          <Text sx={{color: 'fg.muted'}}>Partially indexed •</Text>
          &nbsp;
        </>
      ) : state === TopicIndexStatus.Unindexed ? (
        <>
          <Spinner size="small" sx={{mr: 2}} />
          <Text sx={{color: 'fg.muted'}}>Indexing •</Text>
          &nbsp;
        </>
      ) : (
        <></>
      )}
    </Box>
  )
}
