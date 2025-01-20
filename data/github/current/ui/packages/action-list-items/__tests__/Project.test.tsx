import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemProject, type ActionListItemProjectProps} from '../src/Project'

it('renders the ActionListItemProject', () => {
  const name = 'Shared Component Project'
  render(<ActionListItemProject selectType="action" name={name} />)

  expect(screen.getByRole('listitem')).toHaveTextContent(name)

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toBeVisible()
  expect(icon.classList.contains('octicon-table')).toBe(true)
})

it('isClassic toggles icon', () => {
  const name = 'Shared Component Project'
  render(<ActionListItemProject selectType="action" name={name} isClassic />)

  const icon = screen.getByRole('img', {hidden: true})
  expect(icon).toBeVisible()
  expect(icon.classList.contains('octicon-project')).toBe(true)
})

it('can pass additional props to ActionList.Item', () => {
  const name = 'Shared Component Project'
  render(<ActionListItemProject selectType="action" name={name} role="menuitemradio" disabled />)
  const label = screen.getByRole('menuitemradio')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

const renderActionListAndProject = ({
  selectType = 'action',
  name = 'Shared Component Project',
  isClassic,
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemProjectProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemProject {...typeSpecificProps} name={name} isClassic={isClassic} {...props} />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndProject({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndProject({selectType: 'single'})
    expect(screen.getByTestId('project-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndProject({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays color circle as leading visual', () => {
    renderActionListAndProject({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
