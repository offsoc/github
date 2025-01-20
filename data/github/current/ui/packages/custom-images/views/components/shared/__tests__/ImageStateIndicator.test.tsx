import {render, screen} from '@testing-library/react'
import {ImageDefinitionState, ImageVersionState} from '@github-ui/github-hosted-runners-settings/types/image'
import {ImageStateIndicator} from '../ImageStateIndicator'

describe('ImageStateIndicator', () => {
  const testCases = [
    {state: ImageDefinitionState.Provisioning, text: 'Provisioning', color: 'attention.fg'},
    {state: ImageDefinitionState.Ready, text: 'Ready', color: 'success.fg'},
    {state: ImageDefinitionState.Deleting, text: 'Deleting', color: 'neutral.fg'},
    {state: ImageVersionState.Deleting, text: 'Deleting', color: 'neutral.fg'},
    {state: ImageVersionState.ImportingBlob, text: 'Provisioning', color: 'attention.fg'},
    {state: ImageVersionState.ProvisioningImageVersion, text: 'Provisioning', color: 'attention.fg'},
    {state: ImageVersionState.Generating, text: 'Generating', color: 'attention.fg'},
    {state: ImageVersionState.Ready, text: 'Ready', color: 'success.fg'},
    {state: ImageVersionState.ImportFailed, text: 'Import failed', color: 'danger.fg'},
    {state: null, text: 'Unknown', color: 'attention.fg'},
  ]

  for (const {state, text, color} of testCases) {
    test(`renders correctly with imageState: ${state}`, () => {
      render(<ImageStateIndicator imageState={state} />)

      const textEl = screen.getByText(text)
      expect(textEl).toBeInTheDocument()

      const iconEl = screen.getByRole('img', {hidden: true})
      expect(iconEl).toHaveStyle(`color: ${color}`)
    })
  }
})
