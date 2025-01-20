import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemBranch, type ActionListItemBranchProps} from '../src/Branch'

it('renders the ActionListItemBranch', () => {
  const name = 'Shared Component Branch'
  render(<ActionListItemBranch selectType="action" name={name} />)

  expect(screen.getByRole('listitem')).toHaveTextContent(name)

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toBeVisible()
  expect(icon.classList.contains('octicon-git-branch')).toBe(true)
})

it('can pass additional props to ActionList.Item', () => {
  const name = 'Shared Component Branch'
  render(<ActionListItemBranch selectType="action" name={name} role="menuitemradio" disabled />)
  const label = screen.getByRole('menuitemradio')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

const renderActionListAndBranch = ({
  selectType = 'action',
  name = 'Shared Component Branch',
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemBranchProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemBranch {...typeSpecificProps} name={name} {...props} />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndBranch({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndBranch({selectType: 'single'})
    expect(screen.getByTestId('pull-request-or-branch-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndBranch({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays color circle as leading visual', () => {
    renderActionListAndBranch({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
