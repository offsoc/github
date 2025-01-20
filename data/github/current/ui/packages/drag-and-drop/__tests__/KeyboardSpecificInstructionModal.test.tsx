import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {KeyboardSpecificInstructionsModal} from '../components/KeyboardSpecificInstructionsModal'

describe('KeyboardSpecificInstructionModal', () => {
  it('the instruction dialog is shown on first time use.', () => {
    // TODO: Write test
    expect(true).toBe(true)
  })
  it('the instruction dialog is not shown when a user has selected the "do not show me again" checkbox', () => {
    // TODO: Write test
    expect(true).toBe(true)
  })

  describe('Keyboard navigation', () => {
    it('onClose is called when the instruction dialog is closed using mouse', async () => {
      const onClose = jest.fn()
      const {user} = render(<KeyboardSpecificInstructionsModal isOpen={true} onClose={onClose} direction="vertical" />)

      await user.click(screen.getByLabelText('Close'))
      expect(onClose).toHaveBeenCalled()
    })

    it('onClose is called when the instruction dialog is closed using keyboard', async () => {
      const onClose = jest.fn()
      const {user} = render(<KeyboardSpecificInstructionsModal isOpen={true} onClose={onClose} direction="vertical" />)

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard instructions', () => {
    it('renders default instruction keys when no keyboard code is passed', () => {
      render(<KeyboardSpecificInstructionsModal isOpen={true} onClose={() => {}} direction="vertical" />)
      expect(screen.getByRole('row', {name: 'Cancel drag mode escape'})).toBeDefined()
      expect(screen.getByRole('row', {name: 'Place item space / enter'})).toBeDefined()
    })

    it('renders keyboard instruction keys from consumer when passed', () => {
      render(
        <KeyboardSpecificInstructionsModal
          isOpen={true}
          onClose={() => {}}
          direction="vertical"
          keyboardCodes={{
            start: ['Space'],
            cancel: ['Ctrl', 'Escape'],
            end: ['Enter', 'Space', 'Alt'],
          }}
        />,
      )

      expect(screen.getByRole('row', {name: 'Cancel drag mode ctrl / escape'})).toBeDefined()
      expect(screen.getByRole('row', {name: 'Place item enter / space / alt'})).toBeDefined()
    })
  })
})
