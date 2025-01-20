import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ReplyIcon} from '@primer/octicons-react'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import type {HistoryComparisonRoutePayload} from '../types/rules-types'
import {Box, Text, Label, LinkButton} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLBox} from '@github-ui/safe-html'

export const HistoryComparisonPage = () => {
  const {navigate, resolvePath} = useRelativeNavigation()
  const {ruleset, diffHtml, history} = useRoutePayload<HistoryComparisonRoutePayload>()

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3}}>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', fontSize: 3}}>
          <Link to={resolvePath('../../../..')}>Rulesets</Link>
          <span>/</span>
          <Link to={resolvePath('../../..')}>
            <Text
              sx={{
                display: 'block',
                maxWidth: 200,
                textOverflow: 'ellipsis',
                overflowX: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {ruleset.name}
            </Text>
          </Link>
          <span>/</span>
          <Link to={resolvePath('../..')}>
            <Text
              sx={{
                display: 'block',
                maxWidth: 200,
                textOverflow: 'ellipsis',
                overflowX: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              History
            </Text>
          </Link>
          <span>/</span>
          <span>Compare</span>
        </Box>
        <Box sx={{display: 'flex'}}>
          <Label variant="success">Beta</Label>
          <Box sx={{ml: 2}}>
            <Link to="https://github.com/orgs/community/discussions/69918">Give feedback</Link>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 6,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              minWidth: 0,
              fontSize: 1,
              alignItems: 'center',
              width: 'max-content',
              gap: 2,
              flexBasis: 0,
              flexGrow: 1,
            }}
          >
            <GitHubAvatar sx={{marginRight: 2}} src={history.updated_by.static_avatar_url} />
            <span>{history.updated_by.display_login}</span>
            <Box sx={{display: 'flex', gap: 1, color: 'fg.muted'}}>
              <span>edited</span>
              <relative-time datetime={history.created_at} />
            </Box>
          </Box>
          {!history.is_current ? (
            <LinkButton
              aria-label="Restore ruleset"
              sx={{
                alignItems: 'center',
                color: 'fg.default',
                ...linkButtonSx,
              }}
              onClick={async () => {
                navigate('../../..', `history_id_to_restore=${history.id}`)
              }}
              href={''}
              variant="invisible"
              size={'small'}
              leadingVisual={ReplyIcon}
            >
              <Text sx={{color: 'fg.default'}}>Restore</Text>
            </LinkButton>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 6,
        }}
      >
        <div className="prose-diff no-level-zero-box-shadow">
          <SafeHTMLBox
            className="markdown-body"
            // Extract certain pre styles from typical markdown body class
            style={{
              overflow: 'auto',
              fontSize: '85%',
              lineHeight: 1.45,
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
            }}
            html={diffHtml as SafeHTMLString}
          />
        </div>
      </Box>
    </>
  )
}

const linkButtonSx = {
  '&:hover:not([disabled])': {
    textDecoration: 'none',
  },
  '&:focus:not([disabled])': {
    textDecoration: 'none',
  },
  '&:active:not([disabled])': {
    textDecoration: 'none',
  },
}
