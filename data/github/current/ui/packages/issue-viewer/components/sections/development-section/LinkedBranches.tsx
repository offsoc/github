import {GitBranchIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'

import {VALUES} from '../../../constants/values'
import type {BranchPickerRef$data} from '@github-ui/item-picker/BranchPickerRef.graphql'

type LinkedBranchesProps = {
  linkedBranches: BranchPickerRef$data[]
}

export function LinkedBranches({linkedBranches}: LinkedBranchesProps) {
  return (
    <>
      {linkedBranches.map(branch => {
        return (
          <ActionList.LinkItem
            href={VALUES.branchUrl(branch.name, branch.repository.nameWithOwner)}
            target="_blank"
            key={branch.id}
            sx={{
              span: {
                fontSize: 0,
                lineHeight: 1.5,
                marginBlockEnd: '0',
              },
            }}
          >
            <ActionList.LeadingVisual
              sx={{
                paddingTop: 1,
              }}
            >
              <GitBranchIcon />
            </ActionList.LeadingVisual>
            {branch.name}
            <ActionList.Description variant="block">{branch.repository.nameWithOwner}</ActionList.Description>
          </ActionList.LinkItem>
        )
      })}
    </>
  )
}
