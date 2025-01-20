import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import FooterActions from '../FooterActions'

const footer = (
  <FooterActions
    onCancel={() => {
      return 'Apply'
    }}
    onApply={() => {
      return 'Cancel'
    }}
  />
)

describe('FooterActions', () => {
  test('renders the footer buttons', () => {
    render(footer)

    expect(screen.getByText('Apply')).toBeVisible()
    expect(screen.getByText('Cancel')).toBeVisible()
  })

  test('renders the footer Apply button disabled', () => {
    render(
      <FooterActions
        disabled={true}
        onCancel={() => {
          return 'Apply'
        }}
        onApply={() => {
          return 'Cancel'
        }}
      />,
    )

    expect(screen.getAllByRole('button', {name: 'Cancel'})[0]).not.toHaveAttribute('disabled')
    expect(screen.getAllByRole('button', {name: 'Apply'})[0]).toHaveAttribute('disabled')
  })
})
