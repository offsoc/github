import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemRepository, type ActionListItemRepositoryProps} from '../src/Repository'

it('renders the ActionListItemRepository', () => {
  const nameWithOwner = `ownerName/repoName`
  render(
    <ActionListItemRepository
      id="test-id"
      nameWithOwner={nameWithOwner}
      ownerAvatarUrl="repo-image-url"
      selectType="action"
    />,
  )

  expect(screen.getByRole('listitem')).toHaveTextContent(nameWithOwner)
})

const renderActionListAndRepository = ({
  nameWithOwner = 'ownerName/repoName',
  ownerAvatarUrl = 'https://avatars.githubusercontent.com/mona',
  selectType = 'action',
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemRepositoryProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemRepository
        {...typeSpecificProps}
        nameWithOwner={nameWithOwner}
        ownerAvatarUrl={ownerAvatarUrl}
        {...props}
      />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndRepository({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndRepository({selectType: 'single'})
    expect(screen.getByTestId('repository-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndRepository({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays owner avatar as leading visual', () => {
    renderActionListAndRepository({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
