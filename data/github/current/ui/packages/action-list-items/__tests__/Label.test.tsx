import {render} from '@github-ui/react-core/test-utils'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {getActionListSelectionVariant} from '../common/helpers'
import {ActionListItemLabel, type ActionListItemLabelProps} from '../src/Label'

it('renders the ActionListItemLabel', () => {
  const name = 'Label name'
  render(<ActionListItemLabel id="test-id" selectType="action" name={name} hexColor={'d73a4a'} />)

  expect(screen.getByRole('listitem')).toHaveTextContent(name)
  expect(screen.getByTestId('label-circle')).toHaveStyle({backgroundColor: 'rgb(215, 58, 74)'})
})

it('displays description', () => {
  const name = 'Label name'
  const hexColor = 'd73a4a'
  const description = 'A description for the label'
  render(
    <ActionListItemLabel id="test-id" selectType="action" name={name} hexColor={hexColor} description={description} />,
  )

  expect(screen.getByRole('listitem')).toHaveTextContent(description)
})

it('can pass additional props to ActionList.Item', () => {
  const name = 'Label name'
  const hexColor = 'd73a4a'
  render(
    <ActionListItemLabel
      id="test-id"
      selectType="action"
      name={name}
      hexColor={hexColor}
      role="menuitemradio"
      disabled
    />,
  )
  const label = screen.getByRole('menuitemradio')
  expect(label).toBeVisible()
  expect(label).toHaveAttribute('aria-disabled', 'true')
})

const renderActionListAndLabel = ({
  selectType = 'action',
  name = 'Label name',
  hexColor = 'd73a4a',
  id = 'test-id',
  radioGroupName = 'radio-group-name',
  ...props
}: Partial<ActionListItemLabelProps>) => {
  const typeSpecificProps = selectType !== 'single' ? {selectType} : {selectType, radioGroupName}
  render(
    <ActionList selectionVariant={getActionListSelectionVariant(selectType)}>
      <ActionListItemLabel id={id} {...typeSpecificProps} name={name} hexColor={hexColor} {...props} />
    </ActionList>,
  )
}

describe('selectType is multiple', () => {
  it('displays checkbox', () => {
    renderActionListAndLabel({selectType: 'multiple'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(3)
    expect(label.childNodes[0]?.childNodes[0]).toHaveAttribute('data-component', 'ActionList.Checkbox')
  })
})

describe('selectType is single', () => {
  it('displays radio button', () => {
    renderActionListAndLabel({selectType: 'single'})
    expect(screen.getByTestId('label-radio')).toBeVisible()
  })
})

describe('selectType is instant', () => {
  it('displays checkmark when selected', () => {
    renderActionListAndLabel({selectType: 'instant', selected: true})
    const checkmark = screen
      .getByRole('listitem')
      // eslint-disable-next-line testing-library/no-node-access
      .querySelector('[data-component="ActionList.Selection"] .octicon-check')
    expect(checkmark).toBeVisible()
  })
})

describe('selectType is action', () => {
  it('only displays color circle as leading visual', () => {
    renderActionListAndLabel({selectType: 'action'})
    const label = screen.getByRole('listitem')
    expect(label.childNodes).toHaveLength(2)
  })
})
