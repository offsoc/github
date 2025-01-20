import {DismissibleFlashOrToast, type FlashAlert} from '@github-ui/dismissible-flash'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ListView} from '@github-ui/list-view'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {Link} from '@github-ui/react-core/link'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {DownloadIcon, FileDiffIcon, ReplyIcon} from '@primer/octicons-react'
import {ActionList, Box, Label, Pagination, Text} from '@primer/react'
import {useRef, useState} from 'react'
import {Blankslate} from '../components/Blankslate'
import {BorderBox} from '../components/BorderBox'
import {downloadRuleset} from '../helpers/export-ruleset'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import type {HistorySummaryRoutePayload} from '../types/rules-types'

/**
 * See ListView stories for a representation of this component.
 * ui/packages/list-view/src/stories/RepositoryRulesetHistory.stories.tsx
 * https://ui.githubapp.com/storybook/?path=/story/recipes-list-view-dotcom-pages--repository-ruleset-history
 */
export const HistorySummaryPage = () => {
  const {navigate, resolvePath} = useRelativeNavigation()
  const {readOnly, ruleset, hasMore, page} = useRoutePayload<HistorySummaryRoutePayload>()
  const [flashAlert, setFlashAlert] = useState<FlashAlert>({message: '', variant: 'default'})
  const flashRef = useRef<HTMLDivElement | null>(null)

  const pageCount = hasMore ? page + 1 : page
  const showPagination = hasMore || page > 1

  return (
    <>
      <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3}}>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', fontSize: 3}}>
          <Link to={resolvePath('../..')}>Rulesets</Link>
          <span>/</span>
          <Link to={resolvePath('..')}>
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
          <span>History</span>
        </Box>
        <Box sx={{display: 'flex'}}>
          <Label variant="success">Beta</Label>
          <Box sx={{ml: 2}}>
            <Link to="https://github.com/orgs/community/discussions/69918">Give feedback</Link>
          </Box>
        </Box>
      </Box>
      <BorderBox>
        {(ruleset.histories?.length || 0) > 0 ? (
          <ListView title="Ruleset history" variant="compact">
            {ruleset.histories?.map(({id, created_at, updated_by, is_current}, index) => (
              <ListItem
                key={id}
                title={<ListItemTitle containerSx={{display: 'flex', gap: 1}} value={updated_by.display_login} />}
                secondaryActions={
                  <ListItemActionBar
                    staticMenuActions={[
                      {
                        key: 'history',
                        render: () => (
                          <HistoryActionMenu
                            rulesetName={ruleset.name}
                            historyId={id}
                            readOnly={readOnly}
                            prevHistoryId={ruleset.histories?.[index + 1]?.id || null}
                            canRestore={!is_current}
                            setFlashAlert={setFlashAlert}
                          />
                        ),
                      },
                    ]}
                  />
                }
              >
                <ListItemLeadingContent>
                  <GitHubAvatar sx={{marginRight: 2, alignSelf: 'center'}} src={updated_by.static_avatar_url} />
                </ListItemLeadingContent>
                <ListItemMainContent>
                  <ListItemDescription>
                    <span>edited</span>
                    <relative-time datetime={created_at} />
                  </ListItemDescription>
                </ListItemMainContent>
              </ListItem>
            ))}
          </ListView>
        ) : (
          <Blankslate heading="No ruleset history available" />
        )}
      </BorderBox>
      {showPagination ? (
        <Pagination
          pageCount={pageCount}
          currentPage={page}
          onPageChange={(e, newPage) => {
            e.preventDefault()
            navigate('.', `page=${newPage}`, false)
          }}
          showPages={false}
        />
      ) : null}
    </>
  )
}

type HistoryActionMenuProps = {
  rulesetName: string
  historyId: number
  prevHistoryId: number | null
  readOnly?: boolean
  canRestore?: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
}

const HistoryActionMenu = ({
  rulesetName,
  historyId,
  prevHistoryId,
  readOnly = false,
  canRestore = true,
  setFlashAlert,
}: HistoryActionMenuProps) => {
  const {navigate, resolvePath} = useRelativeNavigation()

  return (
    <ActionList>
      <ActionList.Item
        onSelect={() =>
          prevHistoryId
            ? navigate(`./${historyId}/compare`, `compare_history_id=${prevHistoryId}`, false)
            : navigate(`./${historyId}/compare`, undefined, false)
        }
      >
        <ActionList.LeadingVisual>
          <FileDiffIcon size={16} />
        </ActionList.LeadingVisual>
        Compare changes
        <ActionList.Description variant="block">View a diff of these changes</ActionList.Description>
      </ActionList.Item>
      {!readOnly ? (
        <ActionList.Item
          disabled={!canRestore}
          onSelect={async () => {
            navigate('..', `history_id_to_restore=${historyId}`)
          }}
        >
          <ActionList.LeadingVisual>
            <ReplyIcon size={16} />
          </ActionList.LeadingVisual>
          Restore
          <ActionList.Description variant="block">Restore the ruleset to this version</ActionList.Description>
        </ActionList.Item>
      ) : null}
      <ActionList.LinkItem
        download={`${rulesetName}.json`}
        target="_self"
        onClick={async () => {
          try {
            await downloadRuleset(resolvePath(`../export_ruleset/${historyId}`), rulesetName)
          } catch {
            setFlashAlert({
              variant: 'danger',
              message: 'Error exporting ruleset',
            })
          }
        }}
        className="text-decoration-skip"
      >
        <ActionList.LeadingVisual>
          <DownloadIcon size={16} />
        </ActionList.LeadingVisual>
        Download
        <ActionList.Description variant="block">Download raw file</ActionList.Description>
      </ActionList.LinkItem>
    </ActionList>
  )
}
