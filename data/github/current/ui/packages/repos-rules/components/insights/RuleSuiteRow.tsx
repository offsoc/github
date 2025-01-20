import type {FC} from 'react'
import {useState} from 'react'
import {Box, BranchName, IconButton, Label, Link, Octicon, RelativeTime, Text, Truncate} from '@primer/react'
import {KebabHorizontalIcon, KeyIcon} from '@primer/octicons-react'
import {comparePath, activityIndexPath, repositoryPath} from '@github-ui/paths'
import {SafeHTMLBox} from '@github-ui/safe-html'
import type {Commit, RuleSuite, RuleSuiteResult, SourceType} from '../../types/rules-types'
import {User} from './User'
import {RuleSuiteDetailsDialog} from './RuleSuiteDetailsDialog'
import {PENDING_OID, UNKNOWN_REF_NAME} from '../../helpers/constants'

const refPrefix = 'refs/heads/'

type RuleSuiteRowProps = {
  ruleSuite: RuleSuite
  visibleResult: RuleSuiteResult
  sourceType: SourceType
  sourceName: string
}

export const RuleSuiteRow: FC<RuleSuiteRowProps> = ({ruleSuite, visibleResult, sourceType, sourceName}) => {
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false)

  return (
    <>
      <Box
        as="li"
        sx={{
          borderTopColor: 'border.default',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
          '&:first-child': {borderTopWidth: 0},
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between', padding: 2, paddingX: 3}}>
          <Box sx={{display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center'}}>
            {!createOrDeleteRef(ruleSuite) && (
              <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                <Text sx={{fontWeight: 'bold'}}>{commitMessageOrAction(ruleSuite)}</Text>
              </Box>
            )}
            <Box
              sx={{
                color: 'fg.muted',
                fontSize: 0,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'baseline',
              }}
            >
              {ruleSuite.actor && (
                <Text sx={{mr: 1}}>
                  <User user={ruleSuite.actor} />
                  {ruleSuite.actorIsPublicKey ? (
                    <Octicon aria-label="Pushed with a deploy key" icon={KeyIcon} sx={{ml: 1}} />
                  ) : null}
                </Text>
              )}
              <Text sx={{whiteSpace: 'nowrap'}}>
                <ActionText sourceType={sourceType} ruleSuite={ruleSuite} sourceName={sourceName} />
              </Text>
              <span>&nbsp;</span>
              <RelativeTime date={new Date(ruleSuite.createdAt)} tense="past" />
            </Box>
          </Box>
          <Box sx={{display: ['flex'], alignItems: 'center', marginLeft: 2}}>
            <RuleEvaluationLabel ruleSuite={ruleSuite} visibleResult={visibleResult} />
            <IconButton
              sx={{color: 'fg.muted'}}
              icon={KebabHorizontalIcon}
              variant="invisible"
              aria-label="View rule runs"
              title="View rule runs"
              type="button"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
            />
          </Box>
        </Box>
      </Box>
      {detailsExpanded ? (
        <RuleSuiteDetailsDialog
          ruleSuite={ruleSuite}
          visibleResult={visibleResult}
          onClose={() => setDetailsExpanded(false)}
        />
      ) : null}
    </>
  )
}

function RuleEvaluationLabel({ruleSuite, visibleResult}: {ruleSuite: RuleSuite; visibleResult: RuleSuiteResult}) {
  if (visibleResult === 'allowed') {
    return <Label variant="success">Pass</Label>
  } else if (visibleResult === 'bypassed') {
    return <Label variant="secondary">Bypass</Label>
  } else if (visibleResult === 'failed' && ruleSuite.evaluationMetadata.mergeQueueRemovalReason) {
    return <Label variant="danger">Merge queue failed</Label>
  } else {
    return <Label variant="danger">Fail</Label>
  }
}

function missingRefName(ruleSuite: RuleSuite) {
  return ruleSuite.refName === UNKNOWN_REF_NAME
}

function createOrDeleteRef(ruleSuite: RuleSuite) {
  return !missingRefName(ruleSuite) && (!ruleSuite.beforeOid || !ruleSuite.afterOid)
}

function commitMessageOrAction(ruleSuite: RuleSuite) {
  if (ruleSuite.result === 'failed' && ruleSuite.evaluationMetadata.mergeQueueRemovalReason) {
    return <>Merge group of {ruleSuite.evaluationMetadata.mergeGroupPullRequests?.length} pull requests blocked</>
  } else if (!ruleSuite.afterOid) {
    return 'Deleted branch'
  } else if (ruleSuite.commit?.message) {
    return pushCommitMessage({commit: ruleSuite.commit})
  } else if (ruleSuite.evaluationMetadata.blobEvaluation) {
    return 'Added blobs'
  } else if (missingRefName(ruleSuite)) {
    return 'Added commits'
  } else if (!ruleSuite.beforeOid) {
    return 'Created branch'
  } else {
    return 'Updated branch'
  }
}

function ActionText({
  sourceType,
  ruleSuite,
  sourceName,
}: {
  sourceType: string
  ruleSuite: RuleSuite
  sourceName: string
}) {
  const refName = ruleSuite.refName.startsWith(refPrefix)
    ? ruleSuite.refName.substring(refPrefix.length)
    : ruleSuite.refName

  const beforeSha = ruleSuite.beforeOid?.slice(0, 7)
  const afterSha = ruleSuite.afterOid?.slice(0, 7)

  const pushPhaseFailure = ruleSuite.evaluationMetadata.preReceiveFailure || false
  const commitPending = ruleSuite.beforeOid === PENDING_OID || ruleSuite.afterOid === PENDING_OID
  const queueEntryFailure = ruleSuite.result === 'enter_queue_failed'

  let action = ''
  let compareLink = null

  if (!ruleSuite.afterOid) {
    action = 'deleted'
  } else if (!ruleSuite.beforeOid) {
    action = 'created'

    if (!pushPhaseFailure && missingRefName(ruleSuite) && !commitPending) {
      compareLink = <Link href={comparePath({repo: ruleSuite.repository, head: ruleSuite.afterOid})}>{afterSha}</Link>
    }
  } else {
    action = queueEntryFailure ? 'blocked' : 'pushed'

    if (!pushPhaseFailure && !commitPending) {
      compareLink = (
        <Link href={comparePath({repo: ruleSuite.repository, base: ruleSuite.beforeOid, head: ruleSuite.afterOid})}>
          {`${beforeSha}..${afterSha}`}
        </Link>
      )
    }
  }

  return (
    <>
      <span>{`${action} `}</span>
      {compareLink && (
        <>
          {compareLink}
          <span> </span>
        </>
      )}
      {queueEntryFailure && <span>from merge queue </span>}
      {(compareLink || action === 'pushed') && !missingRefName(ruleSuite) && <span>to </span>}

      {!missingRefName(ruleSuite) && (
        <BranchName href={activityIndexPath({repo: ruleSuite.repository, branch: refName})}>{refName}</BranchName>
      )}
      {sourceType === 'organization' && (
        <>
          <span> in repo </span>
          <BranchName href={repositoryPath({owner: ruleSuite.repository.ownerLogin, repo: ruleSuite.repository.name})}>
            {ruleSuite.repository.ownerLogin !== sourceName && `${ruleSuite.repository.ownerLogin}/`}
            {ruleSuite.repository.name}
          </BranchName>
        </>
      )}
    </>
  )
}

function pushCommitMessage({commit}: {commit: Commit}) {
  return commit.shortMessageHtmlLink ? (
    <Truncate title={commit.message} sx={{maxWidth: '100%'}}>
      <SafeHTMLBox
        sx={{
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
        html={commit.shortMessageHtmlLink}
      />
    </Truncate>
  ) : (
    // Edge case, should never happen (in theory)
    // But if it happens we should at least show something
    commit.message
  )
}
