import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {PropertiesOverlayEditor} from '../PropertiesOverlayEditor'
import {requiredMultiSelectDefinition, requiredStringDefinition} from './test-helpers'

const onApplyMock = jest.fn()
type Props = ComponentProps<typeof PropertiesOverlayEditor>

const sampleProps: Props = {
  org: 'github',
  propertyDefinition: requiredStringDefinition,
  mixed: false,
  onApply: onApplyMock,
}

beforeEach(() => {
  onApplyMock.mockClear()
})

jest.useFakeTimers()

describe('PropertiesOverlayEditor', () => {
  describe('correct initial state', () => {
    it('mixed', async () => {
      const props: Props = {...sampleProps, mixed: true}
      const {user} = render(<PropertiesOverlayEditor {...props} />)

      await user.click(screen.getByText('(Mixed)'))

      const dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('default (us)')).not.toBeChecked()
      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
      expect(dialogContent.getByPlaceholderText('(Mixed)')).toBeInTheDocument()
    })

    it('text with value', async () => {
      const props: Props = {...sampleProps, appliedValue: 'test_value'}
      const {user} = render(<PropertiesOverlayEditor {...props} />)

      await user.click(screen.getByText('test_value'))

      const dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('default (us)')).not.toBeChecked()
      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
    })

    it('multi-select default', async () => {
      const props: Props = {...sampleProps, propertyDefinition: requiredMultiSelectDefinition}
      const {user} = render(<PropertiesOverlayEditor {...props} />)

      await user.click(screen.getByText('default (2 selected)'))

      const dialogContent = within(screen.getByRole('dialog'))
      expect(dialogContent.getByLabelText('default (EU, Asia)')).toBeChecked()
    })

    it('multi-select with value', async () => {
      const props: Props = {
        ...sampleProps,
        propertyDefinition: requiredMultiSelectDefinition,
        appliedValue: ['US', 'EU'],
      }
      const {user} = render(<PropertiesOverlayEditor {...props} />)

      await user.click(screen.getByText('2 selected'))

      const dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('default (EU, Asia)')).not.toBeChecked()
      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
    })
  })

  describe('validation', () => {
    it('shows validation message and does not apply', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      const dialogContent = within(screen.getByRole('dialog'))
      await user.type(dialogContent.getByRole('textbox'), '"Bleeding Gums" Murphy')

      await dialogContent.findByText(/Contains invalid character/)

      await user.click(dialogContent.getByText('Apply'))

      expect(onApplyMock).not.toHaveBeenCalled()
    })

    it('shows missing value error and does not apply', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      const dialogContent = within(screen.getByRole('dialog'))

      await user.clear(dialogContent.getByRole('textbox'))
      await user.click(dialogContent.getByText('Apply'))
      await dialogContent.findByText(/Value is required/)

      expect(onApplyMock).not.toHaveBeenCalled()
    })
  })

  describe('apply', () => {
    it('default value', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      const dialogContent = within(screen.getByRole('dialog'))
      await user.click(dialogContent.getByLabelText('default (us)'))

      await user.click(dialogContent.getByText('Apply'))

      expect(onApplyMock).toHaveBeenCalledWith('')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('custom value', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} />)

      await user.click(screen.getByText('default (us)'))

      const dialogContent = within(screen.getByRole('dialog'))
      await user.click(dialogContent.getByLabelText('Custom value'))

      await user.type(dialogContent.getByRole('textbox'), 'new_value')
      await user.click(dialogContent.getByText('Apply'))

      expect(onApplyMock).toHaveBeenCalledWith('new_value')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('reset', () => {
    it('option is reset on close', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} />)

      await user.click(screen.getByText('default (us)'))

      let dialogContent = within(screen.getByRole('dialog'))
      await user.click(dialogContent.getByLabelText('Custom value'))

      await user.type(dialogContent.getByRole('textbox'), 'new_value')
      await user.click(dialogContent.getByText('Cancel'))

      expect(onApplyMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByText('default (us)'))
      dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('default (us)')).toBeChecked()
    })

    it('value is reset on close', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      let dialogContent = within(screen.getByRole('dialog'))
      await user.type(dialogContent.getByRole('textbox'), 'new_value')

      await user.click(dialogContent.getByText('Cancel'))

      expect(onApplyMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByText('something'))
      dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
      expect(dialogContent.getByRole('textbox')).toHaveValue('something')
    })

    it('value validation is reset on close', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      let dialogContent = within(screen.getByRole('dialog'))
      await user.type(dialogContent.getByRole('textbox'), '"Bleeding Gums" Murphy')
      await dialogContent.findByText(/Contains invalid character/)

      await user.click(dialogContent.getByText('Cancel'))

      expect(onApplyMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByText('something'))
      dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
      expect(dialogContent.queryByText(/Contains invalid character/)).not.toBeInTheDocument()
    })

    it('missing value error is reset on close', async () => {
      const {user} = render(<PropertiesOverlayEditor {...sampleProps} appliedValue="something" />)

      await user.click(screen.getByText('something'))

      let dialogContent = within(screen.getByRole('dialog'))

      await user.clear(dialogContent.getByRole('textbox'))
      await user.click(dialogContent.getByText('Apply'))
      await dialogContent.findByText(/Value is required/)

      expect(onApplyMock).not.toHaveBeenCalled()

      await user.click(dialogContent.getByText('Cancel'))

      expect(onApplyMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(screen.getByText('something'))
      dialogContent = within(screen.getByRole('dialog'))

      expect(dialogContent.getByLabelText('Custom value')).toBeChecked()
      expect(dialogContent.queryByText(/Value is required/)).not.toBeInTheDocument()
    })
  })
})
