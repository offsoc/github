import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {RepoIcon} from '@primer/octicons-react'
import {Box, Heading, Text} from '@primer/react'
import {useMemo} from 'react'

import {isDocset} from '../utils/copilot-chat-helpers'
import type {CopilotChatRepo, Docset} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {ChatWithCopilotHeader} from './ChatWithCopilotHeader'
import {KnowledgeBaseAvatar} from './KnowledgeBaseAvatar'
import TopicList from './TopicList'

export const TopicPicker = () => {
  const state = useChatState()

  const ssoOrgNames = useMemo(() => {
    if (!state.ssoOrganizations) return []
    return state.ssoOrganizations.map(org => org.login)
  }, [state.ssoOrganizations])

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%'}}>
      <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <ChatWithCopilotHeader mode={state.mode} />
        <SingleSignOnBanner
          protectedOrgs={ssoOrgNames}
          sx={{mx: 3, mb: 3}}
          redirectURI={() => `/search/refresh_blackbird_caches?return_to=${location.href}`}
        />
        <Box sx={{px: 3, '> button': {m: '0 auto'}}}>
          <TopicList />
        </Box>
        <TopicDescription currentTopic={state.currentTopic} />
      </Box>
    </Box>
  )
}

function TopicDescription({currentTopic}: {currentTopic: CopilotChatRepo | Docset | undefined}) {
  if (!isDocset(currentTopic)) return null

  return (
    <Box sx={{mt: 3, mb: 4}}>
      <DocsetDescription docset={currentTopic} />
    </Box>
  )
}

function DocsetDescription({docset}: {docset: Docset}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: 'var(--borderRadius-large)',
        padding: 3,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 2}}>
        <KnowledgeBaseAvatar docset={docset} size={24} />
        <Heading as="h3" sx={{fontSize: 1, m: 0}}>
          {docset.name}
        </Heading>{' '}
        <Text sx={{fontSize: 0, color: 'fg.muted'}}>Knowledge base added to conversation</Text>
      </Box>
      <Heading as="h4" sx={{fontSize: 0, m: 0, color: 'fg.muted', fontWeight: '500'}}>
        Repositories in this knowledge base
      </Heading>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 3}}>
        {docset.repos.map(r => (
          <Box key={r} sx={{whiteSpace: 'nowrap'}}>
            <RepoIcon />
            {` ${r}`}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
