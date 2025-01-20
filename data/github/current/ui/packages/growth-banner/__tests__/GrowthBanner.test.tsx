import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {VersionsIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {GrowthBanner} from '../GrowthBanner'

test('Renders with icon', () => {
  const message = 'Write better code with GitHub Copilot'
  render(
    <GrowthBanner icon={VersionsIcon} title="Try GitHub Copilot" {...testIdProps('GrowthBanner')}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByTestId('growth-GrowthBanner-icon')).toBeInTheDocument()
})

test('Renders without icon', () => {
  const message = 'Write better code with GitHub Copilot'
  render(
    <GrowthBanner title="Try GitHub Copilot" {...testIdProps('GrowthBanner')}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.queryByTestId('growth-GrowthBanner-icon')).not.toBeInTheDocument()
})

test('Renders the GrowthBanner with close button and click handler', async () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  const {user} = render(
    <GrowthBanner closeButtonClick={customClick} title="Try GitHub Copilot" {...testIdProps('GrowthBanner')}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByRole('button', {hidden: true, name: 'Close GrowthBanner'})).toBeInTheDocument()

  await user.click(screen.getByRole('button', {hidden: true}))

  expect(customClick).toHaveBeenCalled()
})

test('Renders the GrowthBanner without close button', () => {
  const message = 'Write better code with GitHub Copilot'
  render(
    <GrowthBanner showCloseButton={false} title="Try GitHub Copilot" {...testIdProps('GrowthBanner')}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.queryAllByRole('button', {hidden: true, name: 'Close GrowthBanner'})).toHaveLength(0)
})

test('Renders the GrowthBanner with primary action and click handler', async () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  const {user} = render(
    <GrowthBanner
      primaryButtonProps={{children: 'Start free trial', onClick: customClick}}
      title="Try GitHub Copilot"
      {...testIdProps('GrowthBanner')}
    >
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByRole('button', {hidden: true, name: 'Start free trial'})).toBeInTheDocument()

  await user.click(screen.getByRole('button', {hidden: true, name: 'Start free trial'}))

  expect(customClick).toHaveBeenCalled()
})

test('Renders without primary action', () => {
  const message = 'Write better code with GitHub Copilot'
  render(
    <GrowthBanner title="Try GitHub Copilot" {...testIdProps('GrowthBanner')}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.queryByRole('button', {hidden: true, name: 'Start free trial'})).not.toBeInTheDocument()
})

test('Renders the GrowthBanner with secondary action and click handler', async () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  const {user} = render(
    <GrowthBanner
      secondaryButtonProps={{children: 'Learn more about Copilot', onClick: customClick}}
      title="Try GitHub Copilot"
      {...testIdProps('GrowthBanner')}
    >
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByRole('button', {hidden: true, name: 'Learn more about Copilot'})).toBeInTheDocument()

  await user.click(screen.getByRole('button', {hidden: true, name: 'Learn more about Copilot'}))

  expect(customClick).toHaveBeenCalled()
})

test('Renders the GrowthBanner without secondary action', async () => {
  const message = 'Write better code with GitHub Copilot'
  const customClick = jest.fn()
  const {user} = render(
    <GrowthBanner
      title="Try GitHub Copilot"
      primaryButtonProps={{children: 'Start free trial', onClick: customClick}}
      {...testIdProps('GrowthBanner')}
    >
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByRole('button', {hidden: true, name: 'Start free trial'})).toBeInTheDocument()

  await user.click(screen.getByRole('button', {hidden: true, name: 'Start free trial'}))

  expect(customClick).toHaveBeenCalled()
})

test('Can override styles', () => {
  const message = 'Write better code with GitHub Copilot'
  render(
    <GrowthBanner title="Try GitHub Copilot" {...testIdProps('GrowthBanner')} sx={{borderColor: 'pink'}}>
      {message}
    </GrowthBanner>,
  )
  expect(screen.getByTestId('GrowthBanner')).toHaveTextContent(message)
  expect(screen.getByTestId('GrowthBanner')).toHaveStyle('border-color: pink')
})
