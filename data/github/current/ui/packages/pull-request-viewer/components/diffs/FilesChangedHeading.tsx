import {assertDataPresent} from '@github-ui/assert-data-present'
import {CopilotDiffChatHeaderMenu} from '@github-ui/copilot-code-chat/CopilotDiffChatHeaderMenu'
import {LinesChangedCounterLabel} from '@github-ui/diff-file-header'
import {Box, Text} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {useHasCommitRange} from '../../contexts/SelectedRefContext'
import {filesChangedHeaderMargin} from '../../helpers/sticky-headers'
import DiffViewSettingsButton from '../DiffViewSettingsButton'
import NavigationPaneToggle from '../NavigationPaneToggle'
import type {FilesChangedHeading_pullRequest$key} from './__generated__/FilesChangedHeading_pullRequest.graphql'
import type {FilesChangedHeading_viewer$key} from './__generated__/FilesChangedHeading_viewer.graphql'
import {OpenAnnotationsPanelButton} from './OpenAnnotationsPanelButton'
import {OpenCommentsPanelButton} from './OpenCommentsPanelButton'
import ViewedFileProgress from './ViewedFileProgress'

export default function FilesChangedHeading({
  pullRequest,
  viewer,
}: {
  pullRequest: FilesChangedHeading_pullRequest$key
  viewer: FilesChangedHeading_viewer$key
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment FilesChangedHeading_pullRequest on PullRequest {
        id
        ...DiffViewSettingsButton_pullRequest
        ...ViewedFileProgress_pullRequest
        ...OpenCommentsPanelButton_pullRequest
        ...OpenAnnotationsPanelButton_pullRequest
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          oldCommit {
            oid
          }
          newCommit {
            oid
          }
          linesAdded
          linesDeleted
        }
      }
    `,
    pullRequest,
  )

  const viewerData = useFragment(
    graphql`
      fragment FilesChangedHeading_viewer on User {
        ...DiffViewSettingsButton_user
      }
    `,
    viewer,
  )

  const comparisonData = pullRequestData.comparison
  const hasCommitRange = useHasCommitRange()
  assertDataPresent(comparisonData)

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        display: 'flex',
        justifyContent: 'space-between',
        my: 1,
        py: 2,
        px: 3,
        gap: 2,
        position: 'sticky',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        top: filesChangedHeaderMargin,
        // Set to ensure that the React.Portal used in Conversations dialog hides behind this header
        zIndex: 11,
        ml: '2px',
      }}
    >
      <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
        <NavigationPaneToggle sx={{mr: 2}} />
        <Box as="h2" sx={{fontSize: 2, mr: 2, display: 'inline'}}>
          Files changed
        </Box>
        <LinesChangedCounterLabel isAddition>+{comparisonData.linesAdded}</LinesChangedCounterLabel>
        <LinesChangedCounterLabel isAddition={false}>-{comparisonData.linesDeleted}</LinesChangedCounterLabel>
        <Text sx={{fontSize: 0, ml: 2, color: 'fg.muted', whiteSpace: 'nowrap'}}>lines changed</Text>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0, ml: 3}}>
        {!hasCommitRange && (
          <>
            <OpenAnnotationsPanelButton pullRequest={pullRequestData} />
            <OpenCommentsPanelButton pullRequest={pullRequestData} />
            <ViewedFileProgress pullRequest={pullRequestData} />
          </>
        )}
        <CopilotDiffChatHeaderMenu
          queryVariables={{
            pullRequestId: pullRequestData.id,
            // The OID type somehow ends up as `any` here and TS gets really mad about it
            startOid: comparisonData.oldCommit.oid as string,
            endOid: comparisonData.newCommit.oid as string,
          }}
        />
        <DiffViewSettingsButton pullRequest={pullRequestData} user={viewerData} />
      </Box>
    </Box>
  )
}
