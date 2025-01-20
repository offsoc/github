import {useCallback} from 'react'
import {Box, Button, Text} from '@primer/react'
import {GitBranchIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {dismissRepositoryNoticePathPath, newRulesetPath} from '@github-ui/paths'
import {useCurrentUser} from '../contexts/CurrentUserContext'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useCreateBranchButtonOptions} from '../contexts/CreateBranchButtonOptionContext'

export function ProtectThisBranchBanner({onDismiss}: {onDismiss: () => void}) {
  const currentUser = useCurrentUser()
  const {defaultBranch, ownerLogin, name, id} = useCurrentRepository()
  const {helpUrl} = useCreateBranchButtonOptions()
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const dismissNotice = useCallback(() => {
    if (currentUser) {
      const fetch = async () => {
        const response = await verifiedFetch(
          `${dismissRepositoryNoticePathPath(currentUser)}?notice_name=sculk_protect_this_branch&repository_id=${id}`,
          {
            method: 'DELETE',
          },
        )
        if (response.ok) {
          onDismiss()
        }
      }
      fetch()
    }
  }, [currentUser, id, onDismiss])
  const trackDismissal = useCallback(() => {
    sendClickAnalyticsEvent({
      category: 'suggestion',
      action: 'click_to_dismiss',
      label: `ref_cta:dismiss;ref_loc:repo_branches_listing;`,
    })
  }, [sendClickAnalyticsEvent])

  const trackLearnMore = useCallback(() => {
    sendClickAnalyticsEvent({
      category: 'suggestion',
      action: `click_to_learn_more_about_rulesets`,
      label: `ref_cta:learn_more_about_rulesets;ref_loc:repo_files_listing;`,
    })
  }, [sendClickAnalyticsEvent])

  const trackProtectBranch = useCallback(() => {
    sendClickAnalyticsEvent({
      category: 'suggestion',
      action: 'click_to_add_a_rule',
      label: `ref_cta:protect_this_branch;ref_loc:repo_branches_listing;`,
    })
  }, [sendClickAnalyticsEvent])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderTop: 1,
        overflow: 'hidden',
      }}
      as="aside"
      className="color-border-default js-notice"
      aria-label={`Your ${defaultBranch} branch isn't protected`}
    >
      <Box
        sx={{
          display: 'flex',
          p: 2,
          justifyContent: 'space-between',
          flexDirection: ['column', 'column', 'row', 'row'],
          gap: [2, 2, null, null],
        }}
        data-testid="protect-this-branch-banner"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              float: 'none',
              mr: 3,
              ml: 0,
            }}
            data-testid="protect-this-branch-primer-icon"
            className="branch-action-item-icon completeness-indicator completeness-indicator-problem"
          >
            <GitBranchIcon />
          </Box>
          <div>
            <Box
              as="h3"
              sx={{
                mb: 1,
              }}
              className="h5"
            >
              Your {defaultBranch} branch isn&apos;t protected
            </Box>
            <Text
              as="p"
              sx={{
                fontSize: 0,
                color: 'fg.muted',
                mb: 0,
              }}
            >
              Protect this branch from force pushing or deletion, or require status checks before merging.&nbsp;
              <Link
                onClick={trackLearnMore}
                to={`${helpUrl}/${'repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets'}`}
                style={{
                  textDecoration: 'underline',
                }}
              >
                Learn more
              </Link>
            </Text>
          </div>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            variant="invisible"
            onClick={() => {
              dismissNotice()
              trackDismissal()
            }}
            sx={{
              fontSize: 0,
              color: 'fg.muted',
              mx: 3,
            }}
          >
            Dismiss
          </Button>
          <Link
            onClick={trackProtectBranch}
            to={newRulesetPath({
              owner: ownerLogin,
              repo: name,
            })}
            className="btn btn-sm"
          >
            Protect this branch
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
