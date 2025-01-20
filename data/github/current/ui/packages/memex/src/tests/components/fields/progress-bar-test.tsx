import {render, screen, waitFor} from '@testing-library/react'

import {ProgressBar, ProgressBarVariants} from '../../../client/components/fields/progress-bar'

describe('ProgressBar', () => {
  for (const variant of [ProgressBarVariants.SEGMENTED, ProgressBarVariants.SOLID, ProgressBarVariants.RING]) {
    it(`renders ${variant}`, () => {
      render(<ProgressBar percentCompleted={30} total={100} completed={30} variant={variant} />)

      const progressBar = screen.getByTestId(`progress-bar-${variant.toLowerCase()}`)
      expect(progressBar).toBeInTheDocument()
    })
  }

  for (const variant of [ProgressBarVariants.SEGMENTED, ProgressBarVariants.SOLID]) {
    it(`renders text values for ${variant}`, () => {
      render(<ProgressBar percentCompleted={30} total={100} completed={30} variant={variant} />)

      const progress = screen.getByText('30 / 100')
      expect(progress).toBeInTheDocument()

      const percent = screen.getByText('30%')
      expect(percent).toBeInTheDocument()
    })
  }

  it('renders percentage for ring', async () => {
    render(<ProgressBar percentCompleted={30} total={100} completed={30} variant={ProgressBarVariants.RING} />)

    const progress = screen.getByText('30 / 100')
    expect(progress).toBeInTheDocument()

    await waitFor(() => expect(screen.queryByText('30%')).not.toBeInTheDocument())
  })
})
