import {screen, render} from '@testing-library/react'
import {TypeSubmissionButtons} from '../TypeSubmissionButtons'
import {Resources} from '../../constants/strings'
import {noop} from '@github-ui/noop'

describe('Save changes after editing', () => {
  test('show confirmation text after changes are saved', () => {
    render(
      <TypeSubmissionButtons
        confirmLabel={Resources.saveAfterEditingButton}
        onCancel={noop}
        onConfirm={noop}
        changesSaved={true}
      />,
    )

    expect(screen.getByText('Changes saved')).toBeInTheDocument()
  })
})
