import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import type {TargetsPanelProps} from '../TargetsPanel'
import {TargetsPanel} from '../TargetsPanel'
import {conditions} from '../../../state/__tests__/helpers'
import type {Condition} from '../../../types/rules-types'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const defaultProps: TargetsPanelProps = {
  rulesetId: 1,
  readOnly: false,
  rulesetTarget: 'branch',
  rulesetPreviewCount: undefined,
  rulesetPreviewSamples: [],
  rulesetError: undefined,
  fnmatchHelpUrl: 'https://github.com',
  supportedConditionTargetObjects: ['ref', 'repository'],
  conditions: [],
  dirtyConditions: [],
  refConditionRef: {current: null},
  repositoryConditionRef: {current: null},
  addOrUpdateCondition: jest.fn(),
  removeCondition: jest.fn(),
  source: createRepository({name: 'acme'}),
}

const refNameConditions = conditions.filter(c => c.target === 'ref_name')

describe('TargetsPanel', () => {
  test('should render given empty conditions for an org in edit mode', () => {
    render(<TargetsPanel {...defaultProps} />)

    expect(screen.getByText('Target repositories')).toBeInTheDocument()
    expect(screen.getByText('Target branches') || screen.getByText('Branch targeting criteria')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(3)
  })

  test('should render given empty conditions for an org in read only mode', () => {
    render(<TargetsPanel {...defaultProps} readOnly />)

    expect(screen.getByText('Target repositories')).toBeInTheDocument()
    expect(screen.getByText('Target branches') || screen.getByText('Branch targeting criteria')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  test('should render given empty conditions for a repo in edit mode', () => {
    render(<TargetsPanel {...defaultProps} supportedConditionTargetObjects={['ref']} />)

    expect(screen.queryByText('Target repositories')).toBeNull()
    expect(screen.getByText('Target branches') || screen.getByText('Branch targeting criteria')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(1)
  })

  test('should render given conditions for a repo in read only mode', () => {
    render(<TargetsPanel {...defaultProps} readOnly supportedConditionTargetObjects={['ref']} />)

    expect(screen.queryByText('Target repositories')).toBeNull()
    expect(screen.getByText('Target branches') || screen.getByText('Branch targeting criteria')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  test('should render ref_name conditions and matches', () => {
    render(
      <TargetsPanel
        {...defaultProps}
        conditions={refNameConditions}
        supportedConditionTargetObjects={['ref']}
        rulesetPreviewCount={1}
        rulesetPreviewSamples={['matched_branch']}
      />,
    )
    const listItems = screen.queryAllByRole('listitem')

    // see conditions.parameters.filter(c => c.target_type === 'ref_name')
    // parameters are sorted include > exclude, then in source order
    /// includes
    expect(listItems[0]).toHaveTextContent('main')
    expect(listItems[1]).toHaveTextContent('release/*')
    // excludes
    expect(listItems[2]).toHaveTextContent('master')

    // repoConditions.parameters.include.length + repoConditions.parameters.exclude.length
    expect(listItems).toHaveLength(3)

    expect(screen.getByText('Applies to 1 target:')).toBeInTheDocument()
    expect(screen.getByText('matched_branch')).toBeInTheDocument()
  })

  test('should render ref_name and repository_name conditions and matches', () => {
    render(
      <TargetsPanel
        {...defaultProps}
        conditions={conditions}
        rulesetPreviewCount={2}
        rulesetPreviewSamples={['main', 'develop']}
      />,
    )

    const listItems = screen.queryAllByRole('listitem')

    // see conditions.parameters.filter(c => c.target_type === 'repository_name')
    // parameters are sorted include > exclude, then in source order
    /// includes
    expect(listItems[0]).toHaveTextContent('smile')
    expect(listItems[1]).toHaveTextContent('public-server')
    expect(listItems[2]).toHaveTextContent('fishsticks*')
    // excludes
    expect(listItems[3]).toHaveTextContent('fishsticks-sneaky')

    // conditions.parameters.include.length + conditions.parameters.exclude.length
    expect(listItems).toHaveLength(7)
  })

  test('should render <=10 matches', () => {
    const matches = new Array(11).fill(0).map((_, index) => `match-${index}`)
    render(<TargetsPanel {...defaultProps} rulesetPreviewCount={11} rulesetPreviewSamples={matches.slice(0, 10)} />)

    // conditions.parameters.include.length + conditions.parameters.exclude.length
    expect(screen.getByText('match-9')).toBeInTheDocument()
    expect(screen.getByText('and others')).toBeInTheDocument()
    expect(screen.queryByText('match-10')).toBeNull()
  })

  test('should render error message', () => {
    render(<TargetsPanel {...defaultProps} rulesetError="An error occurred" />)

    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })

  test('should render a link for a property ruleset', () => {
    const propertyConditions: Condition[] = [
      {
        target: 'repository_property',
        parameters: {
          exclude: [],
          include: [
            {
              name: 'database',
              source: 'custom',
              property_values: ['mysql'],
            },
          ],
        },
        _dirty: false,
      },
    ]

    render(
      <TargetsPanel
        {...defaultProps}
        conditions={propertyConditions}
        rulesetPreviewCount={3}
        rulesetPreviewSamples={[]}
      />,
    )

    expect(screen.getByText(/Applies to/i)).toBeInTheDocument()
    expect(screen.getByRole('link', {name: '3 repositories'})).toHaveAttribute(
      'href',
      '/orgs/acme/repositories?q=props.database%3Amysql',
    )
  })
})
