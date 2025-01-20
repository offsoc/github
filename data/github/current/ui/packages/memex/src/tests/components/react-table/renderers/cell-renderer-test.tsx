import {render, screen} from '@testing-library/react'

import {ItemType} from '../../../../client/api/memex-items/item-type'
import {withCellRenderer} from '../../../../client/components/react_table/renderers/cell-renderer'

/**
 * This is matching the render result linter, when it shouldn't
 */
// eslint-disable-next-line testing-library/render-result-naming-convention
const CellRenderer = withCellRenderer(() => <button>Cell</button>)

describe('withCellRenderer', () => {
  it('renders the content when not redacted', () => {
    const draftIssueItemData = {contentType: ItemType.DraftIssue, id: 1}

    render(<CellRenderer model={draftIssueItemData} />)
    const button = screen.queryByRole('button')

    expect(button).toBeInTheDocument()
  })

  it('returns null if item is redacted', () => {
    const redactedIssueItemData = {contentType: ItemType.RedactedItem, id: 1}

    render(<CellRenderer model={redactedIssueItemData} />)
    const button = screen.queryByRole('button')

    expect(button).not.toBeInTheDocument()
  })
})
