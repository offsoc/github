import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemUser, type ActionListItemUserProps} from '../src/User'

it('renders the ActionListItemUser', () => {
  const username = 'monalisa'
  const fullName = 'Mona Lisa'
  const avatarUrl = 'https://avatars.githubusercontent.com/mona'
  render(<ActionListItemUser selectType="action" username={username} fullName={fullName} avatarUrl={avatarUrl} />)

  expect(screen.getByRole('listitem')).toHaveTextContent(username)
  expect(screen.getByRole('listitem')).toHaveTextContent(fullName)
  expect(screen.getByRole('img')).toHaveAttribute('src', `${avatarUrl}?size=40`)
})

it('can pass additional props to ActionList.Item', () => {
  const username = 'monalisa'
  const fullName = 'Mona Lisa'
  const avatarUrl = 'https://avatars.githubusercontent.com/mona'
  render(
    <ActionListItemUser
      selectType="action"
      username={username}
      fullName={fullName}
      avatarUrl={avatarUrl}
      role="menuitemradio"
      disabled
    />,
  )
  const label = screen.getByRole('menuitemradio')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

const renderActionListAndUser = ({
  selectType = 'action',
  username = 'monalisa',
  fullName = 'Mona Lisa',
  avatarUrl = 'https://avatars.githubusercontent.com/mona',
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemUserProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemUser
        {...typeSpecificProps}
        username={username}
        fullName={fullName}
        avatarUrl={avatarUrl}
        {...props}
      />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndUser({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndUser({selectType: 'single'})
    expect(screen.getByTestId('user-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndUser({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays color circle as leading visual', () => {
    renderActionListAndUser({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
