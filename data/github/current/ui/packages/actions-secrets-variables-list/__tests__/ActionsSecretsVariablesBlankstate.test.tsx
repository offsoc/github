import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {TableBlankstate} from '../ActionsSecretsVariablesBlankstate'
import {ItemsScope, ListMode, type RowData} from '../types'
import {TableAction} from '../TableAction'

const blankstateTextScenarios = [
  {
    scope: ItemsScope.Repository,
    emptyMessage: 'This repository has no secrets.',
    isEditableInScope: true,
    isPrivateRepoInFreeOrg: false,
  },
  {
    scope: ItemsScope.Environment,
    emptyMessage: 'This environment has no secrets.',
    isEditableInScope: true,
    isPrivateRepoInFreeOrg: false,
  },
  {
    scope: ItemsScope.Organization,
    emptyMessage: 'This organization has no secrets.',
    isEditableInScope: true,
    isPrivateRepoInFreeOrg: false,
  },
  {
    scope: ItemsScope.Organization,
    emptyMessage:
      'Organization secrets can only be used by public repositories on your plan. If you would like to use organization secrets in a private repository, you will need to upgrade your plan.',
    isEditableInScope: false,
    isPrivateRepoInFreeOrg: true,
  },
  {
    scope: ItemsScope.Organization,
    emptyMessage: 'There are no organization secrets available to this repository.',
    isEditableInScope: false,
    isPrivateRepoInFreeOrg: false,
  },
  {
    scope: ItemsScope.OrgHostSetup,
    emptyMessage: 'This organization has no host setup secrets.',
    isEditableInScope: false,
    isPrivateRepoInFreeOrg: true,
  },
  {
    scope: ItemsScope.OrgDevEnv,
    emptyMessage: 'This organization has no development environment secrets.',
    isEditableInScope: true,
    isPrivateRepoInFreeOrg: false,
  },
  {
    scope: ItemsScope.CodespaceUser,
    emptyMessage: 'There are no Codespace secrets.',
    isEditableInScope: true,
    isPrivateRepoInFreeOrg: false,
  },
]

describe.each(blankstateTextScenarios)('Renders the TableBlankstate messages', scenario => {
  test(`Renders the TableBlankstate with for ${scenario.scope}`, () => {
    const tableAction = (
      <TableAction
        mode={ListMode.secret}
        url={'/new'}
        message={'New secret'}
        useDialog={false}
        isEditableInScope={scenario.isEditableInScope}
        tableDataUpdater={() => {
          return new Array<RowData>()
        }}
      />
    )
    render(
      <TableBlankstate
        scope={scenario.scope}
        mode={ListMode.secret}
        description={{
          text: 'Blank state description',
          contextUrl: 'context/url',
          contextLinkText: 'context link text',
        }}
        tableAction={tableAction}
        isEditableInScope={scenario.isEditableInScope}
        isPrivateRepoInFreeOrg={scenario.isPrivateRepoInFreeOrg}
      />,
    )
    expect(screen.getByText(scenario.emptyMessage)).toBeInTheDocument()
    if (scenario.isEditableInScope) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.getByTestId('table-action')).toBeInTheDocument()
    }
  })
})
