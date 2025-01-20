import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemPullRequest, type ActionListItemPullRequestProps} from '../src/PullRequest'

it('renders the ActionListItemPullRequest', () => {
  const name = 'Shared Component PullRequest'
  render(<ActionListItemPullRequest selectType="action" name={name} />)

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toBeVisible()
  expect(icon.classList.contains('octicon-git-pull-request')).toBe(true)
})

it('can pass additional props to ActionList.Item', () => {
  const name = 'Shared Component PullRequest'
  render(<ActionListItemPullRequest selectType="action" name={name} role="menuitemradio" disabled />)
  const label = screen.getByRole('menuitemradio')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

const renderActionListAndPullRequest = ({
  selectType = 'action',
  name = 'Shared Component PullRequest',
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemPullRequestProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemPullRequest {...typeSpecificProps} name={name} {...props} />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndPullRequest({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndPullRequest({selectType: 'single'})
    expect(screen.getByTestId('pull-request-or-branch-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndPullRequest({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays color circle as leading visual', () => {
    renderActionListAndPullRequest({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
