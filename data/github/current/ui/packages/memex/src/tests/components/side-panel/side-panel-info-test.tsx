import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import {DescriptionEditor} from '../../../client/components/description-editor'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

const mockOnSaveStats = jest.fn()
const mockSetHasUnsavedChanges = jest.fn()

describe('Side Panel Info', () => {
  beforeEach(() => {
    mockUseHasColumnData()
  })

  it('should render a heading for "ReadMe"', () => {
    createTestEnvironment({
      'memex-viewer-privileges': overrideDefaultPrivileges({
        role: Role.Write,
        canChangeProjectVisibility: false,
      }),
    })
    render(
      <TestAppContainer>
        <DescriptionEditor onSaveStats={mockOnSaveStats} setHasUnsavedChanges={mockSetHasUnsavedChanges} />
      </TestAppContainer>,
    )

    expect(screen.getByText('README')).toBeInTheDocument()
  })

  it('should render a pencil icon and opens editor mode if user has write access', async () => {
    createTestEnvironment({
      'memex-viewer-privileges': overrideDefaultPrivileges({
        role: Role.Write,
        canChangeProjectVisibility: false,
      }),
    })
    render(
      <TestAppContainer>
        <DescriptionEditor onSaveStats={mockOnSaveStats} setHasUnsavedChanges={mockSetHasUnsavedChanges} />
      </TestAppContainer>,
    )
    const pencilIconButton = screen.getByTestId('pencil-editor-button')
    expect(pencilIconButton).toBeEnabled()
    await userEvent.click(pencilIconButton)
    expect(within(screen.getByTestId('markdown-editor')).getByRole('textbox')).toBeEnabled()
  })

  it('should NOT render a pencil icon if user does NOT have write access', () => {
    createTestEnvironment({
      'memex-viewer-privileges': overrideDefaultPrivileges({
        role: Role.Read,
        canChangeProjectVisibility: false,
      }),
    })
    render(
      <TestAppContainer>
        <DescriptionEditor onSaveStats={mockOnSaveStats} setHasUnsavedChanges={mockSetHasUnsavedChanges} />
      </TestAppContainer>,
    )

    expect(screen.queryByTestId('pencil-editor-button')).toBeNull()
  })
})
