import type React from 'react'
import {useState} from 'react'
import {type ActionsAndWorkflowsAllowedSetting, type PolicyFormWrapper, NO_POLICY, SELECT_ACTIONS} from '../types'
import {ActionList, ActionMenu} from '@primer/react'

const POLICY_TO_DISPLAY_NAME = new Map<ActionsAndWorkflowsAllowedSetting, string>([
  [NO_POLICY, 'No policy'],
  [SELECT_ACTIONS, 'Select actions'],
])

export const PolicySelector: React.FC<PolicyFormWrapper> = ({form, setPolicyForm}) => {
  const {noPolicyOrSelectedActions} = form
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <ActionMenu aria-labelledby="actions-policy-dropdown" open={menuOpen} onOpenChange={value => setMenuOpen(value)}>
      <ActionMenu.Button>{POLICY_TO_DISPLAY_NAME.get(noPolicyOrSelectedActions)}</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single" variant="full" showDividers>
          <ActionList.Item
            sx={{'&:hover': {borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}}
            selected={noPolicyOrSelectedActions === NO_POLICY}
            onSelect={() =>
              setPolicyForm({
                ...form,
                noPolicyOrSelectedActions: NO_POLICY,
              })
            }
          >
            No policy
            <ActionList.Description variant="block">
              All actions and reusable workflows in the enterprise and GitHub.com are searchable and permitted in the
              enterprise.
            </ActionList.Description>
          </ActionList.Item>
          <ActionList.Divider sx={{margin: 0}} />
          <ActionList.Item
            sx={{'&:hover': {borderTopLeftRadius: 0, borderTopRightRadius: 0}}}
            selected={noPolicyOrSelectedActions === SELECT_ACTIONS}
            onSelect={() =>
              setPolicyForm({
                ...form,
                noPolicyOrSelectedActions: SELECT_ACTIONS,
              })
            }
          >
            Select actions
            <ActionList.Description variant="block">
              Actions created in the enterprise can be used, along with select non-enterprise actions and reusable
              workflows.
            </ActionList.Description>
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
