import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {CustomPropertyBooleanSelect, type CustomPropertyBooleanSelectProps} from '../CustomPropertyBooleanSelect'

describe('CustomPropertyBooleanSelect', () => {
  it('selects initial value and calls back new value on change', async () => {
    const onChangeMock = jest.fn()
    const booleanProps: CustomPropertyBooleanSelectProps = {
      defaultValue: null,
      mixed: false,
      onChange: onChangeMock,
      orgName: 'github',
      propertyValue: 'true',
    }

    const {user} = render(<CustomPropertyBooleanSelect {...booleanProps} />)

    await user.click(screen.getByRole('button', {name: 'true'}))

    expect(screen.queryByRole('menuitemradio', {name: 'Mixed'})).not.toBeInTheDocument()

    const trueOption = screen.getByRole('menuitemradio', {name: 'true'})
    expect(trueOption).toHaveAttribute('aria-checked', 'true')

    await user.click(trueOption)
    expect(onChangeMock).toHaveBeenCalledWith('')
  })

  it('renders mixed state', async () => {
    const booleanProps: CustomPropertyBooleanSelectProps = {
      defaultValue: null,
      mixed: true,
      onChange: jest.fn(),
      orgName: 'github',
      propertyValue: '',
    }

    const {user} = render(<CustomPropertyBooleanSelect {...booleanProps} />)

    await user.click(screen.getByRole('button', {name: '(Mixed)'}))

    const mixedOption = screen.getByRole('menuitemradio', {name: 'Mixed'})
    expect(mixedOption).toHaveAttribute('aria-checked', 'true')
    expect(mixedOption).toHaveAttribute('data-inactive', 'true')
  })

  it('renders default value selection and calls back empty value on change', async () => {
    const onChangeMock = jest.fn()
    const booleanProps: CustomPropertyBooleanSelectProps = {
      defaultValue: 'true',
      mixed: false,
      onChange: onChangeMock,
      orgName: 'github',
      propertyValue: '',
    }

    const {user} = render(<CustomPropertyBooleanSelect {...booleanProps} />)

    await user.click(screen.getByRole('button', {name: 'default (true)'}))
    expect(screen.queryByRole('menuitemradio', {name: 'Mixed'})).not.toBeInTheDocument()

    const defaultOption = screen.getByRole('menuitemradio', {name: 'default (true)'})
    expect(defaultOption).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Inherited from')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'github'})).toHaveAttribute('href', '/github')

    await user.click(defaultOption)
    expect(onChangeMock).toHaveBeenCalledWith('')
  })

  it('renders mixed state with default values', async () => {
    const booleanProps: CustomPropertyBooleanSelectProps = {
      defaultValue: 'false',
      mixed: true,
      onChange: jest.fn(),
      orgName: 'github',
      propertyValue: '',
    }

    const {user} = render(<CustomPropertyBooleanSelect {...booleanProps} />)

    await user.click(screen.getByRole('button', {name: '(Mixed)'}))

    const mixedOption = screen.getByRole('menuitemradio', {name: 'Mixed'})
    expect(mixedOption).toHaveAttribute('aria-checked', 'true')
    expect(mixedOption).toHaveAttribute('data-inactive', 'true')

    expect(screen.getByRole('menuitemradio', {name: 'default (false)'})).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Inherited from')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'github'})).toHaveAttribute('href', '/github')
  })
})
