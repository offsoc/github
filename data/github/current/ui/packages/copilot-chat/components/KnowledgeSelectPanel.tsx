import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {BookIcon, XIcon} from '@primer/octicons-react'
import {
  ActionList,
  AnchoredOverlay,
  Box,
  Button,
  Heading,
  IconButton,
  Link,
  Octicon,
  Text,
  Tooltip,
  Truncate,
} from '@primer/react'
import {SelectPanel} from '@primer/react/drafts'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {isDocset, makeDocsetReference} from '../utils/copilot-chat-helpers'
import {TopicIndexStatus, useReposIndexingState} from '../utils/copilot-chat-hooks'
import type {CopilotChatOrg, Docset} from '../utils/copilot-chat-types'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {useChatAutocomplete} from '../utils/CopilotChatAutocompleteContext'
import {useChatPanelReferenceContext, useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

/**
 *
 * This component started as a scrappy copy of the `ReferencesSelectPanel` component.
 * Important differences:
 * - A user can only select one knowledge base at a time
 * - Knowledge base references are persisted between conversation turns
 * - We load all knowledge bases up front and filter them client side
 *
 * Future work:
 * - Add a Beta label
 * - Group knowledge bases by Organization
 */
export const KnowledgeSelectPanel = ({panelWidth}: {panelWidth?: number}) => {
  const state = useChatState()
  const manager = useChatManager()
  const autocomplete = useChatAutocomplete()

  const {knowledgeBases} = state
  const [administratedCopilotEnterpriseOrganizations, setAdministratedCopilotEnterpriseOrganizations] = useState<
    CopilotChatOrg[]
  >([])
  const [orgLoading, setOrgLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const anchorRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const onSearchInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    setFilter(event.currentTarget.value)
  }

  const filteredItems = useMemo(() => {
    if (filter === '') return knowledgeBases
    return knowledgeBases.filter(item => {
      return item.name.toLowerCase().includes(filter.toLowerCase())
    })
  }, [filter, knowledgeBases])

  const groups = useMemo(() => {
    return filteredItems.reduce<Array<{org: string; docsets: Docset[]}>>((orgs, item) => {
      const entry = orgs.find(org => org.org === item.ownerLogin)
      if (entry) {
        entry.docsets.push(item)
      } else {
        orgs.push({org: item.ownerLogin, docsets: [item]})
      }
      return orgs
    }, [])
  }, [filteredItems])

  const [isOrgLoadingError, setIsOrgLoadingError] = useState(false)

  const loading = orgLoading || state.knowledgeBasesLoading.state === 'pending'
  const isError = isOrgLoadingError || state.knowledgeBasesLoading.state === 'error'

  useEffect(() => {
    const fetchDocsetsAndOrgs = async () => {
      setOrgLoading(true)
      await manager.fetchKnowledgeBases()
      const orgResponse = await manager.service.listAdministratedCopilotEnterpriseOrganizations()
      if (orgResponse.ok) {
        setAdministratedCopilotEnterpriseOrganizations(orgResponse.payload || [])
      } else {
        setIsOrgLoadingError(true)
      }
      setOrgLoading(false)
    }

    void fetchDocsetsAndOrgs()
    // Just run once when component loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // close the panel when the user clicks outside of it
  const mouseListener = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'DIALOG') {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', mouseListener)
    return () => {
      document.removeEventListener('click', mouseListener)
    }
  }, [mouseListener])

  // focus the search box, not the close button, on panel open
  // TODO: a future version of @primer/react should fix this
  useEffect(() => {
    if (open && containerRef.current) {
      // This type assertion is, in fact, not necessary, but eslint thinks it isn't
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const searchInput = containerRef.current.querySelector('input[type=text]') as HTMLInputElement | null
      searchInput?.focus()
    }
  }, [open])

  const {currentReferences} = state
  const ssoMessage = getSSOMessage()

  const onSelectedChange = (docset: Docset) => {
    void manager.dismissAttachKnowledgeBaseHerePopover()

    // Clear up all existing references
    manager.clearCurrentReferences()

    const reference = makeDocsetReference(docset)

    void autocomplete.addToReferences(reference, state)
  }

  const panelRef = useChatPanelReferenceContext()
  const styleOverrides = useMemo(() => {
    const overrides: Record<string, string> = {}
    if (state.mode !== 'assistive' || !open) return overrides

    const width = panelRef?.current?.clientWidth || 480
    const isSmallishWindow = width + 480 >= window.innerWidth

    if (isSmallishWindow) {
      overrides.left = `${window.innerWidth - width}px !important`
    }

    if (isSmallishWindow && window.innerHeight >= 480) {
      overrides.bottom = '64px'
    }
    return overrides
  }, [state.mode, panelRef, open])

  const persistentPanelStyles =
    state.mode === 'assistive'
      ? {
          position: 'fixed',
          bottom: 0,
          right: `${panelWidth || copilotLocalStorage.DEFAULT_PANEL_WIDTH}px`,
          left: 'auto !important',
          top: 'auto !important',
          height: '325px',
          maxHeight: '100%',
          ...styleOverrides,
        }
      : {
          position: ['fixed', 'fixed', 'absolute'],
          bottom: ['60px', '60px', '0 !important'],
          '@media screen and (max-height: 480px)': {
            bottom: '0 !important',
          },
          top: 'initial !important',
          left: ['18px', '18px', 'calc(50% - 360px) !important'],
          height: '325px',
          maxHeight: '100%',
        }

  if (isError) {
    return (
      <Tooltip aria-label="There was an error loading knowledge bases" direction="e">
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          variant="invisible"
          size="small"
          disabled
          icon={BookIcon}
          aria-label="There was an error loading knowledge bases"
        />
      </Tooltip>
    )
  }

  if (!loading && knowledgeBases.length === 0) {
    return <EmptyKnowledgeBase />
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        flexGrow: '0 !important',
        '> dialog': persistentPanelStyles,
      }}
      {...testIdProps('knowledge-select-panel')}
    >
      {/* We're using an external anchor with the SelectPanel to enable us to close the panel when the user clicks outside of it. */}
      {/* Once we're using @primer/react > 36.9.0, we can revert the commit that added this. */}
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        aria-expanded={open ? true : undefined}
        aria-haspopup
        aria-label="Attach knowledge base"
        aria-labelledby={undefined}
        icon={BookIcon}
        onClick={() => setOpen(!open)}
        ref={anchorRef}
        size="small"
        sx={{color: 'fg.muted'}}
        variant="invisible"
      />
      <SelectPanel
        anchorRef={anchorRef}
        description="Knowledge bases consolidate content from multiple repositories for an improved chat experience."
        onCancel={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
        open={open}
        selectionVariant="instant"
        title="Attach a knowledge base"
      >
        <SelectPanel.Header>
          <SelectPanel.SearchInput
            loading={loading}
            onChange={onSearchInputChange}
            placeholder="Search knowledge bases"
          />
        </SelectPanel.Header>
        <ActionList>
          {groups.map(group => (
            <ActionList.Group key={group.org}>
              <ActionList.GroupHeading>{group.org}</ActionList.GroupHeading>
              {group.docsets.map(docset => (
                <KnowledgeBaseSelectRow key={docset.id} docset={docset} />
              ))}
            </ActionList.Group>
          ))}
        </ActionList>
        {ssoMessage && (
          <SelectPanel.Footer>
            <SSOFooter message={ssoMessage} />
          </SelectPanel.Footer>
        )}
      </SelectPanel>
    </Box>
  )

  function EmptyKnowledgeBase() {
    return (
      <AnchoredOverlay
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderAnchor={({...anchorProps}) => {
          return (
            // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
            <IconButton
              unsafeDisableTooltip={true}
              aria-label="Attach knowledge"
              aria-labelledby={undefined}
              size="small"
              icon={BookIcon}
              variant="invisible"
              {...anchorProps}
            />
          )
        }}
        overlayProps={{
          anchorSide: 'outside-bottom',
          sx: {
            width: '350px',
            // If in assitive mode then we want to use the persistent styles so
            // it is positioned like the SelectPanel that is used when there is
            // at least 1 knowledge base. Otherwise, use the AnchoredOverlay
            // styles to position it in the immersive mode above the icon.
            ...(state.mode === 'assistive' ? persistentPanelStyles : {}),
          },
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column'}} {...testIdProps('empty-knowledge-base-picker')}>
          <Box
            sx={{
              borderBottom: '1px solid',
              borderColor: 'border.muted',
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 3}}>
              <Heading as="h4" sx={{fontSize: 1}}>
                Attach a knowledge base
              </Heading>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                aria-label="Close"
                icon={XIcon}
                variant="invisible"
                onClick={() => setOpen(false)}
              />
            </Box>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 3}}>
            <Octicon icon={BookIcon} size="medium" sx={{color: 'fg.muted'}} />
            <Box sx={{gap: 2, display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <Text sx={{fontSize: 1, fontWeight: 600}}>You don&apos;t have any knowledge bases</Text>
              <Box sx={{color: 'fg.muted', textAlign: 'center', fontSize: 0, px: 3}}>
                <p>Knowledge bases consolidate content from multiple repositories for an improved chat experience.</p>
                {administratedCopilotEnterpriseOrganizations.length === 0 && (
                  <Text as="p" sx={{mt: 3, mb: 4}} {...testIdProps('ask-admin-for-knowledge-base')}>
                    Speak with an organization owner about creating a knowledge base for your organization.
                  </Text>
                )}
              </Box>

              {administratedCopilotEnterpriseOrganizations.length > 0 && <CreateKnowledgeBaseButton />}
            </Box>
          </Box>
          {ssoMessage && (
            <Box sx={{borderTop: '1px solid', borderColor: 'border.muted', px: 2, py: 3}}>
              <SSOFooter message={ssoMessage} />
            </Box>
          )}
        </Box>
      </AnchoredOverlay>
    )
  }

  function CreateKnowledgeBaseButton() {
    if (administratedCopilotEnterpriseOrganizations.length === 1) {
      return (
        <Button
          as="a"
          href={pathToChatSettings(administratedCopilotEnterpriseOrganizations[0]!)}
          sx={{mb: 4}}
          {...testIdProps('create-knowledge-base-button')}
        >
          Create a knowledge base
        </Button>
      )
    } else {
      return (
        <Box
          sx={{width: '100%', textAlign: 'left', borderTop: '1px solid', borderColor: 'border.muted', pt: 3}}
          {...testIdProps('create-knowledge-base-dropdown')}
        >
          <Heading as="h3" sx={{fontSize: 0, color: 'fg.muted', pl: 3}}>
            Create a knowledge base for an organization
          </Heading>
          <ActionList sx={{maxHeight: '160px', overflow: 'scroll'}}>
            {administratedCopilotEnterpriseOrganizations.map(org => (
              <CreateKnowledgeBaseActionRow key={org.id} org={org} />
            ))}
          </ActionList>
        </Box>
      )
    }
  }

  function CreateKnowledgeBaseActionRow({org}: {org: CopilotChatOrg}) {
    return (
      <ActionList.Item>
        {/* It is ok to link directly to chats settings even if the org needs SSO. If the user needs to SSO in they
            will be taken to the SSO page and redirected to the chat settings URL on successful authentication */}
        <Link sx={{flex: 1, color: 'fg.default'}} href={pathToChatSettings(org)}>
          <GitHubAvatar square={true} src={org.avatarUrl} alt={org.login} sx={{mr: 2}} aria-hidden="true" />
          <Truncate inline title={org.login} sx={{minWidth: '80%'}}>
            {org.login}
          </Truncate>
        </Link>
      </ActionList.Item>
    )
  }

  function KnowledgeBaseSelectRow({docset}: {docset: Docset}) {
    const [indexingState] = useReposIndexingState(docset.repos, true)

    return (
      <ActionList.Item
        key={docset.id}
        onSelect={() => onSelectedChange(docset)}
        selected={currentReferences.some(ref => isDocset(ref) && ref.id === docset.id)}
        disabled={indexingState.docs !== TopicIndexStatus.Indexed && indexingState.docs !== TopicIndexStatus.Unknown}
      >
        {docset.name}
        <ActionList.Description
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexBasis: 'content',
          }}
          variant="block"
        >
          {docset.description}
        </ActionList.Description>
      </ActionList.Item>
    )
  }

  function SSOFooter({message}: {message: string}) {
    if (message) {
      return (
        <Box data-testid="knowledge-select-panel-sso" sx={{color: 'fg.muted', fontSize: 0, ml: 2}}>
          {message}
        </Box>
      )
    } else {
      return <></>
    }
  }

  function getSSOMessage() {
    const allProtectedOrgs = state.ssoOrganizations.map(org => org.login)
    for (const item of knowledgeBases) {
      const protectedOrganizations = item.protectedOrganizations
      for (const org of protectedOrganizations) {
        if (!allProtectedOrgs.includes(org)) {
          allProtectedOrgs.push(org)
        }
      }
    }

    if (!allProtectedOrgs || allProtectedOrgs.length === 0) {
      return null
    } else if (allProtectedOrgs.length === 1) {
      return `Single sign-on to see content from ${allProtectedOrgs[0]!}.`
    } else if (allProtectedOrgs.length === 2) {
      return `Single sign-on to see content from ${allProtectedOrgs[0]!} and ${allProtectedOrgs[1]!}.`
    } else {
      const remainder = allProtectedOrgs.length - 2
      return `Single sign-on to see content from ${allProtectedOrgs[0]!}, ${allProtectedOrgs[1]!}, and ${remainder} organization${
        remainder > 1 ? 's' : ''
      }`
    }
  }

  function pathToChatSettings(org: CopilotChatOrg) {
    return `/organizations/${org.login}/settings/copilot/chat_settings/new`
  }
}
