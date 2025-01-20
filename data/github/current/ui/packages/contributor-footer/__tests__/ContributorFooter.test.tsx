import {render, screen} from '@testing-library/react'
import {ContributorFooter} from '../ContributorFooter'
import {isEnterprise} from '@github-ui/runtime-environment'

jest.mock('@github-ui/runtime-environment')
const mockedIsEnterprise = jest.mocked(isEnterprise)

beforeEach(() => {
  mockedIsEnterprise.mockReturnValue(false)
})

afterEach(() => {
  mockedIsEnterprise.mockClear()
})

test('does not render if there are no files', () => {
  const props = {
    contributingFileUrl: undefined,
    securityPolicyUrl: undefined,
    codeOfConductFileUrl: undefined,
  }
  render(<ContributorFooter {...props} />)

  expect(screen.queryByText(/Remember, contributions to this repository should follow its/)).not.toBeInTheDocument()
})

test('renders all with separators', () => {
  const props = {
    contributingFileUrl: 'contributing-file-url',
    securityPolicyUrl: 'security-policy-url',
    codeOfConductFileUrl: 'code-of-conduct-url',
  }
  render(<ContributorFooter {...props} />)

  const notice = screen.getByText(/Remember, contributions to this repository should follow its/)
  expect(notice.textContent).toMatchInlineSnapshot(
    `"Remember, contributions to this repository should follow its contributing guidelines, security policy and code of conduct."`,
  )
})

test('it does not render in enterprise', () => {
  mockedIsEnterprise.mockReturnValue(true)

  const props = {
    contributingFileUrl: 'contributing-file-url',
    securityPolicyUrl: 'security-policy-url',
    codeOfConductFileUrl: 'code-of-conduct-url',
  }
  render(<ContributorFooter {...props} />)

  expect(screen.queryByText(/Remember, contributions to this repository should follow its/)).not.toBeInTheDocument()
  mockedIsEnterprise.mockClear()
})

test('renders only contributing', () => {
  const props = {
    contributingFileUrl: 'contributing-file-url',
    securityPolicyUrl: undefined,
    codeOfConductFileUrl: undefined,
  }
  render(<ContributorFooter {...props} />)

  const notice = screen.getByText(/Remember, contributions to this repository should follow its/)
  expect(notice.textContent).toMatchInlineSnapshot(
    `"Remember, contributions to this repository should follow its contributing guidelines."`,
  )

  const coc = screen.getByText('contributing guidelines')
  expect(coc).toBeInTheDocument()
  expect(coc).toHaveAttribute('href', 'contributing-file-url')

  expect(screen.queryByText('security policy')).not.toBeInTheDocument()
  expect(screen.queryByText('code of conduct')).not.toBeInTheDocument()
})

test('renders only security policy', () => {
  const props = {
    contributingFileUrl: undefined,
    securityPolicyUrl: 'security-policy-url',
    codeOfConductFileUrl: undefined,
  }
  render(<ContributorFooter {...props} />)

  const notice = screen.getByText(/Remember, contributions to this repository should follow its/)
  expect(notice.textContent).toMatchInlineSnapshot(
    `"Remember, contributions to this repository should follow its security policy."`,
  )

  const coc = screen.getByText('security policy')
  expect(coc).toBeInTheDocument()
  expect(coc).toHaveAttribute('href', 'security-policy-url')

  expect(screen.queryByText('code of conduct')).not.toBeInTheDocument()
  expect(screen.queryByText('contributing guidelines')).not.toBeInTheDocument()
})

test('renders only coc', () => {
  const props = {
    contributingFileUrl: undefined,
    securityPolicyUrl: undefined,
    codeOfConductFileUrl: 'code-of-conduct-url',
  }
  render(<ContributorFooter {...props} />)

  const notice = screen.getByText(/Remember, contributions to this repository should follow its/)
  expect(notice.textContent).toMatchInlineSnapshot(
    `"Remember, contributions to this repository should follow its code of conduct."`,
  )

  const coc = screen.getByText('code of conduct')
  expect(coc).toBeInTheDocument()
  expect(coc).toHaveAttribute('href', 'code-of-conduct-url')

  expect(screen.queryByText('contributing guidelines')).not.toBeInTheDocument()
  expect(screen.queryByText('security policy')).not.toBeInTheDocument()
})
