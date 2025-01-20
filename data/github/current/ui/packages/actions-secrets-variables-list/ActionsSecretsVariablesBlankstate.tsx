import {Blankslate} from '@primer/react/drafts'
import {Text} from '@primer/react'

import {DescriptionElement} from './DescriptionElement'
import {ItemsScope, type ActionsSecretsVariablesBlankstateProps as TableBlankstateProps} from './types'

export function TableBlankstate({
  scope,
  mode,
  description,
  tableAction,
  isEditableInScope,
  isPrivateRepoInFreeOrg,
}: TableBlankstateProps) {
  const lowerCaseScope = scope.toLowerCase()
  const tableName = `${scope} ${mode}s`
  let emptyMessage = ''

  switch (scope) {
    case ItemsScope.Repository:
      emptyMessage = `This repository has no ${mode}s.`
      break
    case ItemsScope.Environment:
      emptyMessage = `This environment has no ${mode}s.`
      break
    case ItemsScope.Organization:
      if (isEditableInScope) {
        emptyMessage = `This organization has no ${mode}s.`
      } else if (isPrivateRepoInFreeOrg) {
        emptyMessage = `Organization ${mode}s can only be used by public repositories on your plan. If you would like to use organization ${mode}s in a private repository, you will need to upgrade your plan.`
      } else {
        emptyMessage = `There are no organization ${mode}s available to this repository.`
      }
      break
    case ItemsScope.OrgHostSetup:
      emptyMessage = `This organization has no host setup ${mode}s.`
      break
    case ItemsScope.OrgDevEnv:
      emptyMessage = `This organization has no development environment ${mode}s.`
      break
    case ItemsScope.CodespaceUser:
      emptyMessage = `There are no Codespace ${mode}s.`
      break
  }

  return (
    <>
      <Text as="h2" id={`${lowerCaseScope}-${mode}s`} sx={{fontSize: 2, fontWeight: 'bold'}}>
        {tableName}
      </Text>
      {description.text ? <DescriptionElement description={description} /> : undefined}
      <div className="border rounded-2 mt-2">
        <Blankslate>
          <Blankslate.Description>
            <Text sx={{color: 'fg.muted', fontSize: 1, display: 'flex', textAlign: 'center'}}>{emptyMessage}</Text>
          </Blankslate.Description>
          <div className="mt-2" data-testid={'table-action'}>
            {tableAction}
          </div>
        </Blankslate>
      </div>
    </>
  )
}

export default TableBlankstate
