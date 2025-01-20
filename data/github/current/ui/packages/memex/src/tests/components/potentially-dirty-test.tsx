import {testIdProps} from '@github-ui/test-id-props'
import {ThemeProvider} from '@primer/react'
import {cleanup, render, screen} from '@testing-library/react'

import {PotentiallyDirty} from '../../client/components/potentially-dirty'

const testId = 'is-dirty'

const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <ThemeProvider
      theme={{
        colors: {
          accent: {
            emphasis: '#FF0000',
          },
          canvas: {
            overlay: '#00FF00',
          },
        },
      }}
    >
      {children}
    </ThemeProvider>
  )
}

describe('PotentiallyDirty', () => {
  afterEach(cleanup)

  const additionalProps = testIdProps(testId)

  it('use isDirty to indicate whether the element should be displayed', () => {
    const {rerender} = render(<PotentiallyDirty isDirty={false} {...additionalProps} />, {wrapper})

    expect(screen.queryByTestId(testId)).not.toBeInTheDocument()

    rerender(<PotentiallyDirty isDirty {...additionalProps} />)

    expect(screen.getByTestId(testId)).toBeInTheDocument()
    expect(screen.getByTestId(testId)).toHaveStyleRule('background-color', '#FF0000')
    expect(screen.getByTestId(testId)).toHaveAccessibleName('Unsaved changes')
  })

  it('renders hidden element if isDirty=true and hideDirtyState=true', () => {
    render(<PotentiallyDirty isDirty hideDirtyState {...additionalProps} />, {wrapper})

    const element = screen.getByTestId(testId)

    expect(element).toBeInTheDocument()
    expect(element).toHaveStyleRule('position', 'relative')
    expect(element).not.toHaveStyleRule('background-color')
  })

  it('renders children if provided', () => {
    const {rerender} = render(
      <PotentiallyDirty isDirty={false} {...additionalProps}>
        <span>hello world</span>
      </PotentiallyDirty>,
      {wrapper},
    )

    expect(screen.getByText('hello world')).toBeInTheDocument()

    rerender(
      <PotentiallyDirty isDirty {...additionalProps}>
        <span>hello world</span>
      </PotentiallyDirty>,
    )

    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})
