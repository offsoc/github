import {screen, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import type {IncludeExcludeType} from '../TargetsTable'
import {TargetsTable} from '../TargetsTable'

const blankslate = {
  heading: 'Test',
  description: 'test',
}

describe('TargetsTable', () => {
  test('should render given an empty disabled ruleset', () => {
    render(
      <TargetsTable
        renderTitle={renderTitle}
        blankslate={blankslate}
        targets={targets(['main', 'master'], 'include')}
        onRemove={jest.fn}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(screen.getByText('master')).toBeInTheDocument()
  })

  test('should pass patternType and target back to onRemove when clicking the delete button', () => {
    const onRemove = jest.fn()
    render(
      <TargetsTable
        renderTitle={renderTitle}
        blankslate={blankslate}
        targets={targets(['main', 'master'], 'include')}
        onRemove={onRemove}
      />,
    )

    fireEvent.click(screen.getByLabelText('Delete include of main'))

    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('include', 'main', 'name')
  })

  test('should render without the delete button with readOnly={true}', () => {
    render(
      <TargetsTable
        renderTitle={renderTitle}
        blankslate={blankslate}
        targets={targets(['main', 'master'], 'exclude')}
        readOnly
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(screen.getByText('master')).toBeInTheDocument()
  })
})

function renderTitle() {
  return <h3>Test</h3>
}

function targets(targetList: string[], type: IncludeExcludeType) {
  return targetList.map(target => ({type, prefix: 'name', value: target}))
}
