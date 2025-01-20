import {SkipIcon} from '@primer/octicons-react'
import {Box, StateLabel, Text} from '@primer/react'

import {State, StateReason} from '../../api/common-contracts'
import {type IssueMetadataState, ItemKeyType} from '../../api/side-panel/contracts'

/**
 * @param issue The issue for which to show state.
 * @param overrideState Override the state if a more accurate value is available than what's on the item object.
 */
export const ItemStateLabel: React.FC<{itemType: ItemKeyType; state: IssueMetadataState}> = ({itemType, state}) => {
  let label = null
  if (itemType === ItemKeyType.PROJECT_DRAFT_ISSUE) {
    label = <DraftIssueState />
  }
  if (itemType === ItemKeyType.ISSUE) {
    label = <IssueState state={state.state} reason={state.stateReason} />
  }

  return label ? (
    <Box as="figure" sx={{m: 0}}>
      <figcaption style={{position: 'absolute', clipPath: 'circle(0)'}}>Item status</figcaption>
      {label}
    </Box>
  ) : null
}

const DraftIssueState = () => (
  <StateLabel status="issueDraft" variant="small">
    Draft
  </StateLabel>
)

const IssueState: React.FC<{state: State; reason?: StateReason}> = ({state, reason}) =>
  state === State.Open ? (
    <StateLabel status="issueOpened" variant="small" className="prc-StateLabel--open">
      Open
    </StateLabel>
  ) : state === State.Closed && reason === StateReason.NotPlanned ? (
    <StateLabel
      status="draft"
      variant="small"
      sx={{'& > svg:first-child': {visibility: 'hidden', position: 'absolute'}}}
    >
      <SkipIcon />
      <Text sx={{pl: 1}}>Closed</Text>
    </StateLabel>
  ) : state === State.Closed ? (
    <StateLabel status="issueClosed" variant="small">
      Closed
    </StateLabel>
  ) : null
