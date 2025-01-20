import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import BranchDescription from '../components/BranchDescription'
import {getBranches} from '../test-utils/mock-data'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

jest.mock('@github-ui/react-core/use-feature-flag')
const mockUseFeatureFlag = jest.mocked(useFeatureFlag)

test('renders the BranchDescription component', () => {
  const branch = getBranches()[0]!

  render(<BranchDescription {...branch} rulesetsPath="/" />)

  expect(screen.getByRole('link', {name: branch.name})).toBeVisible()
  expect(screen.getByRole('button', {name: 'Copy branch name to clipboard'})).toBeVisible()
  expect(screen.getByRole('tooltip', {name: 'View rules'})).toBeVisible()
  expect(screen.getByRole('link', {name: 'This branch is protected'})).toBeVisible()
  const ruleButton = screen.getByRole('button', {name: 'This branch is protected'})
  expect(ruleButton).toBeVisible()
  const icon = within(ruleButton).getByRole('img', {hidden: true})
  expect(icon).toHaveClass('octicon-shield')
  expect(screen.queryByRole('tooltip', {name: 'This branch is protected by branch protections'})).toBeNull()
})

test('renders shield with link when rulesetsPath is present and protectedByBranchProtections is true', () => {
  mockUseFeatureFlag.mockReturnValue(true)

  const branch = getBranches()[0]!

  render(<BranchDescription {...branch} rulesetsPath="/" protectedByBranchProtections={true} />)

  expect(screen.getByRole('tooltip', {name: 'View rules'})).toBeVisible()
  expect(screen.getByRole('link', {name: 'This branch is protected'})).toBeVisible()
  const ruleButton = screen.getByRole('button', {name: 'This branch is protected'})
  expect(ruleButton).toBeVisible()
  const icon = within(ruleButton).getByRole('img', {hidden: true})
  expect(icon).toHaveClass('octicon-shield')
  expect(screen.queryByRole('tooltip', {name: 'This branch is protected by branch protections'})).toBeNull()
})

test('renders shield without link when rulesetsPath is null and protectedByBranchProtections is true', () => {
  mockUseFeatureFlag.mockReturnValue(true)

  const branch = getBranches()[0]!

  render(<BranchDescription {...branch} rulesetsPath={undefined} protectedByBranchProtections={true} />)

  expect(screen.queryByRole('tooltip', {name: 'View rules'})).toBeNull()
  expect(screen.queryByRole('link', {name: 'This branch is protected'})).toBeNull()
  expect(screen.getByTestId('branch-protection-shield')).toBeVisible()
  expect(screen.queryByRole('button', {name: 'This branch is protected'})).toBeNull()
  expect(screen.getByRole('tooltip', {name: 'This branch is protected by branch protections'})).toBeVisible()
})

test('does not render shield when rulesetsPath is null and protectedByBranchProtections is false', () => {
  mockUseFeatureFlag.mockReturnValue(true)

  const branch = getBranches()[0]!

  render(<BranchDescription {...branch} rulesetsPath={undefined} protectedByBranchProtections={false} />)

  expect(screen.queryByRole('tooltip', {name: 'View rules'})).toBeNull()
  expect(screen.queryByRole('link', {name: 'This branch is protected'})).toBeNull()
  expect(screen.queryByTestId('branch-protection-shield')).toBeNull()
  expect(screen.queryByRole('button', {name: 'This branch is protected'})).toBeNull()
  expect(screen.queryByRole('tooltip', {name: 'This branch is protected by branch protections'})).toBeNull()
})
