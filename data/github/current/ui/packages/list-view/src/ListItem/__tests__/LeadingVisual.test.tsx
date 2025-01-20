import {render} from '@github-ui/react-core/test-utils'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {screen, within} from '@testing-library/react'

import {ListView} from '../../ListView/ListView'
import {ListItemLeadingVisual, type ListItemLeadingVisualProps} from '../LeadingVisual'
import {NewActivityProvider} from '../NewActivityContext'
import {StatusProvider} from '../StatusContext'

function renderLeadingVisual(props: ListItemLeadingVisualProps) {
  return render(
    <ListView title="test leading visual list">
      <li>
        <NewActivityProvider>
          <StatusProvider>
            <ListItemLeadingVisual {...props} />
          </StatusProvider>
        </NewActivityProvider>
      </li>
    </ListView>,
  )
}

it('should render an icon', () => {
  renderLeadingVisual({color: 'fg.muted', icon: IssueOpenedIcon, description: 'test description'})

  const leadingVisual = screen.getByTestId('list-view-leading-visual')
  expect(within(leadingVisual).getByRole('img', {hidden: true})).toBeInTheDocument()
})

it('should render an child prop that is passed in', () => {
  renderLeadingVisual({description: 'test description', children: <div>Test child</div>})

  const leadingVisual = screen.getByTestId('list-view-leading-visual')
  expect(leadingVisual).toBeInTheDocument()
  expect(within(leadingVisual).getByText('Test child')).not.toBeNull()
})

it('should render an icon and a child prop when both an image and a child are passed in', () => {
  renderLeadingVisual({color: 'fg.muted', icon: IssueOpenedIcon, children: <div>Test child</div>})

  const leadingVisual = screen.getByTestId('list-view-leading-visual')
  expect(leadingVisual).toBeInTheDocument()

  expect(within(leadingVisual).getByRole('img', {hidden: true})).not.toBeNull()
  expect(within(leadingVisual).getByText('Test child')).not.toBeNull()
})

it('should render a description', () => {
  renderLeadingVisual({color: 'fg.muted', icon: IssueOpenedIcon, description: 'test description'})
  const leadingVisual = screen.getByTestId('list-view-leading-visual')
  const textDescription = within(leadingVisual).getByTestId('leading-visual-text-description')

  expect(leadingVisual).toBeInTheDocument()
  expect(textDescription).toHaveTextContent('test description')
})

it('should not render an icon or child when neither are passed in', () => {
  renderLeadingVisual({description: 'test description'})

  const leadingVisual = screen.getByTestId('list-view-leading-visual')
  expect(leadingVisual).toBeInTheDocument()
  expect(leadingVisual.childNodes).toHaveLength(1)
  expect(within(leadingVisual).getByTestId('leading-visual-text-description')).not.toBeNull()
})

it('should not render the sr-only span for screen reader if no description is passed in', () => {
  renderLeadingVisual({color: 'fg.muted', icon: IssueOpenedIcon})
  const leadingVisual = screen.getByTestId('list-view-leading-visual')

  expect(leadingVisual).toBeInTheDocument()
  expect(within(leadingVisual).queryByTestId('leading-visual-text-description')).toBeNull()
})
