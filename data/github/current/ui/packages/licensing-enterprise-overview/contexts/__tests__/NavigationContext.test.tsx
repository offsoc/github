import {render, screen} from '@testing-library/react'
import {NavigationContextProvider, useNavigation} from '../../contexts/NavigationContext'

describe('NavigationContextProvider', () => {
  test('renders children with correct context for stafftools', () => {
    const TestComponent = () => {
      const {basePath, enterpriseContactUrl, isStafftools} = useNavigation()
      return (
        <div>
          <div data-testid="basePath">{basePath}</div>
          <div data-testid="enterpriseContactUrl">{enterpriseContactUrl}</div>
          <div data-testid="isStafftools">{isStafftools.toString()}</div>
        </div>
      )
    }

    render(
      <NavigationContextProvider enterpriseContactUrl={'/enterprise-contact-url'} isStafftools={true} slug={'test-co'}>
        <TestComponent />
      </NavigationContextProvider>,
    )

    expect(screen.getByTestId('basePath')).toHaveTextContent('/stafftools/enterprises/test-co')
    expect(screen.getByTestId('enterpriseContactUrl')).toHaveTextContent('/enterprise-contact-url')
    expect(screen.getByTestId('isStafftools')).toHaveTextContent('true')
  })

  test('renders children with correct context for non-stafftools', () => {
    const TestComponent = () => {
      const {basePath, enterpriseContactUrl, isStafftools} = useNavigation()
      return (
        <div>
          <div data-testid="basePath">{basePath}</div>
          <div data-testid="enterpriseContactUrl">{enterpriseContactUrl}</div>
          <div data-testid="isStafftools">{isStafftools.toString()}</div>
        </div>
      )
    }

    render(
      <NavigationContextProvider enterpriseContactUrl={'/enterprise-contact-url'} isStafftools={false} slug={'test-co'}>
        <TestComponent />
      </NavigationContextProvider>,
    )

    expect(screen.getByTestId('basePath')).toHaveTextContent('/enterprises/test-co')
    expect(screen.getByTestId('enterpriseContactUrl')).toHaveTextContent('/enterprise-contact-url')
    expect(screen.getByTestId('isStafftools')).toHaveTextContent('false')
  })
})
