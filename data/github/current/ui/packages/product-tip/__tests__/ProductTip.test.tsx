import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ProductTip} from '../ProductTip'

test('Renders the ProductTip with close button', () => {
  const message = 'Write better code with GitHub Copilot'
  render(<ProductTip showCloseButton={true}>{message}</ProductTip>)
  expect(screen.getByTestId('growth-tip')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-tip-close')).toBeInTheDocument()
})

test('Renders the ProductTip without close button', () => {
  const message = 'Write better code with GitHub Copilot'
  render(<ProductTip showCloseButton={false}>{message}</ProductTip>)
  expect(screen.getByTestId('growth-tip')).toHaveTextContent(message)
  expect(screen.queryByTestId('growth-tip-close')).not.toBeInTheDocument()
})

test('Renders the ProductTip with close button and click handler', async () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  const {user} = render(
    <ProductTip showCloseButton={true} closeButtonClick={customClick}>
      {message}
    </ProductTip>,
  )
  expect(screen.getByTestId('growth-tip')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-tip-close')).toBeInTheDocument()

  await user.click(screen.getByTestId('growth-tip-close'))

  expect(customClick).toHaveBeenCalled()
})

test('Renders the ProductTip with close button, click handler, and primary button', async () => {
  const message = 'Write better code with GitHub Copilot'
  const closeClick = jest.fn()
  const primaryClick = jest.fn()
  const {user} = render(
    <ProductTip
      showCloseButton={true}
      closeButtonClick={closeClick}
      primaryButtonProps={{onClick: primaryClick, children: 'Try GitHub Copilot'}}
    >
      {message}
    </ProductTip>,
  )
  expect(screen.getByTestId('growth-tip')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-tip-close')).toBeInTheDocument()
  expect(screen.getByTestId('growth-tip-action')).toHaveTextContent('Try GitHub Copilot')

  await user.click(screen.getByTestId('growth-tip-action'))
  expect(primaryClick).toHaveBeenCalled()

  await user.click(screen.getByTestId('growth-tip-close'))
  expect(closeClick).toHaveBeenCalled()
})

test('Can override styles', () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  render(
    <ProductTip showCloseButton={false} closeButtonClick={customClick} sx={{borderColor: 'pink'}}>
      {message}
    </ProductTip>,
  )
  expect(screen.getByTestId('growth-tip')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-tip')).toHaveStyle('border-color: pink')
})
