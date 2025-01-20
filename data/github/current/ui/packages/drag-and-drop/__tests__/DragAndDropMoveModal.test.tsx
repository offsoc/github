import {render} from '@github-ui/react-core/test-utils'
import {ArrowSwitchIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import {act, screen} from '@testing-library/react'

import {MoveModalTrigger} from '../components/MoveModalTrigger'
import {DragAndDrop} from '../drag-and-drop'
import {DragAndDropMoveOptions} from '../utils/types'
import {
  expectAnnouncement,
  expectErrorMessage,
  expectFlashMessage,
  selectAfter,
  selectBefore,
  selectMoveAction,
  selectRow,
  submitModal,
} from './utils'

// Tell Jest to mock all timeout functions
jest.useFakeTimers()

const defaultItems = [
  {id: '1', title: 'In progress'},
  {id: '2', title: 'Todo'},
  {id: '3', title: "Won't do"},
  {id: '4', title: 'Blocked'},
  {id: '5', title: 'Done'},
]
let onDrop: jest.Mock

function renderList(items = defaultItems) {
  onDrop = jest.fn()
  return render(
    <>
      <div
        id="js-global-screen-reader-notice-assertive"
        data-testid="js-global-screen-reader-notice-assertive"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
      <DragAndDrop
        items={items}
        onDrop={onDrop}
        renderOverlay={(item, index) => (
          <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
            {item.title}
            <MoveModalTrigger Component={Button} icon={ArrowSwitchIcon} aria-label={`move ${item.title} advanced`} />
          </DragAndDrop.Item>
        )}
      >
        {items.map((item, index) => (
          <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
            {item.title}
            <MoveModalTrigger Component={Button} icon={ArrowSwitchIcon} aria-label={`move ${item.title} advanced`} />
          </DragAndDrop.Item>
        ))}
      </DragAndDrop>
    </>,
  )
}

async function openModalFromList(rowNumber: number, items = defaultItems) {
  const title = items[rowNumber - 1]?.title ?? ''
  const utils = renderList()

  await utils.user.click(screen.getByRole('button', {name: `move ${title} advanced`}))

  act(() => jest.runAllTimers())

  return utils
}

describe('Move Modal', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message: string) => {
      // * Because autocomplete is asynchronous, there are console errors that are thrown, but expected. This will rethrow
      // * any errors that are not related to the async nature of the component.
      if (!message.includes?.('wrapped in act(')) {
        // eslint-disable-next-line no-console
        console.warn(message)
      }
    })
  })

  describe('aria-attributes', () => {
    it('move to row input is labelled when action is changed', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)

      expect(screen.getByRole('spinbutton', {name: /Move to row */i})).toBeDefined()
    })

    it('move item after combobox is labelled when action is changed.', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.AFTER)

      expect(screen.getByRole('combobox', {name: /Move item after */i})).toBeDefined()
    })

    it('move item before combobox is labelled when action is changed.', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.BEFORE)

      expect(screen.getByRole('combobox', {name: /Move item before */i})).toBeDefined()
    })
  })

  describe('Announcements', () => {
    it('announcement when a user moves an item to the top of the list and submits.', async () => {
      await openModalFromList(3)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(1)
      await submitModal()

      expectAnnouncement("Won't do successfully moved to first item in list.")
    })

    it('announcement when a user moves an item to the bottom of the list and submits.', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(5)
      await submitModal()

      expectAnnouncement('Todo successfully moved to last item in list.')
    })

    it('announcement when a user does not move an item to the middle of the list and submits', async () => {
      await openModalFromList(1)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(1)
      await submitModal()

      expectAnnouncement('In progress did not move.')
    })

    it('announcement when a user moves an item to the middle of the list and submits', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(3)
      await submitModal()

      expectAnnouncement("Todo successfully moved between Blocked and Won't do.")
    })

    it('announcement when a user cancels out of move dialog.', async () => {
      const {user} = await openModalFromList(2)

      await user.click(screen.getByRole('button', {name: 'Close'}))
      expectAnnouncement('Cancel moving Todo')
    })

    it('announcement when the flash feedback span is updated for before', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.BEFORE)

      await selectBefore('Done')

      expectFlashMessage('Todo will be between Blocked and Done.')

      await selectBefore()
      await selectBefore('In progress')
      expect(screen.queryByRole('option', {name: /Won't do/i})).not.toBeInTheDocument()
      expect(screen.queryByRole('option', {name: /Todo/i})).not.toBeInTheDocument()

      expectFlashMessage('Todo will be first item in the list.')
    })

    it('announcement when the flash feedback span is updated for after', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.AFTER)

      await selectAfter('Done')
      expectFlashMessage('Todo will be last item in the list.')

      await selectAfter()
      expect(screen.queryByRole('option', {name: /In progress/i})).not.toBeInTheDocument()
      expect(screen.queryByRole('option', {name: /Todo/i})).not.toBeInTheDocument()

      await selectAfter("Won't do")
      expectFlashMessage("Todo will be between Won't do and Blocked.")
    })

    it('announcement when the flash feedback span is updated for Row', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)

      await selectRow(2)
      expectFlashMessage('Todo will not be moved.')

      await selectRow(7)
      expectFlashMessage('Todo cannot be moved to an invalid position.')
    })
  })
  describe('Navigation', () => {
    it('the move dialog opens when the "Move" action is pressed', async () => {
      await openModalFromList(2)

      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('the move dialog is closed when the "X" button is pressed', async () => {
      const {user} = await openModalFromList(2)

      expect(screen.getByRole('dialog')).toBeDefined()
      await user.click(screen.getByRole('button', {name: /Close/i}))

      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('the move dialog is closed when the "Submit" button is pressed', async () => {
      await openModalFromList(1)

      await selectMoveAction(DragAndDropMoveOptions.BEFORE)
      await selectBefore('Done')
      await submitModal()

      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('the item is moved to the last position in the list', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(5)
      await submitModal()

      expect(onDrop).toHaveBeenCalledWith({dragMetadata: {id: '2'}, dropMetadata: {id: '5'}, isBefore: false})
    })

    it('the item is moved to the first position in the list', async () => {
      await openModalFromList(4)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(1)
      await submitModal()

      expect(onDrop).toHaveBeenCalledWith({dragMetadata: {id: '4'}, dropMetadata: {id: '1'}, isBefore: true})
    })

    it('the item is moved in the middle of the list', async () => {
      await openModalFromList(5)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(2)
      await submitModal()

      expect(onDrop).toHaveBeenCalledWith({dragMetadata: {id: '5'}, dropMetadata: {id: '2'}, isBefore: true})
    })

    it('the item is moved to the middle of the list using the move item before field', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.BEFORE)
      await selectBefore('Done')
      await submitModal()

      expect(onDrop).toHaveBeenCalledWith({dragMetadata: {id: '2'}, dropMetadata: {id: '5'}, isBefore: true})
    })

    it('the item is moved to the middle of the list using the move item after field', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.AFTER)
      await selectAfter('Done')
      await submitModal()

      expect(onDrop).toHaveBeenCalledWith({dragMetadata: {id: '2'}, dropMetadata: {id: '5'}, isBefore: false})
    })
  })

  describe('Trigger button', () => {
    it('should visually hide drag trigger when only one item in list', () => {
      renderList(defaultItems[0] ? [defaultItems[0]] : [])

      expect(screen.queryByTestId('sortable-trigger-container')).toHaveClass('v-hidden')
    })

    it('should display drag trigger when for each item in list', () => {
      renderList()

      expect(screen.getAllByRole('button')).toHaveLength(defaultItems.length * 2)
    })
  })

  describe('Error Validation', () => {
    it('should announce and display error messages when moving item to row 0', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(0)
      expectFlashMessage('Todo cannot be moved to an invalid position.')

      await submitModal()
      expectErrorMessage('Entry must be greater than 0.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })

    it('should announce and display error messages when moving item to row with a negative number', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(-1)
      expectFlashMessage('Todo cannot be moved to an invalid position.')

      await submitModal()
      expectErrorMessage('Entry must be greater than 0.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })

    it('should announce and display error messages when moving item to row with a number larger than number of items', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow(11)
      expectFlashMessage('Todo cannot be moved to an invalid position.')

      await submitModal()
      expectErrorMessage('Entry must be less than or equal to 5.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })

    it('should announce and display error messages when moving item to row with empty input', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.ROW)
      await selectRow()
      await submitModal()

      expectFlashMessage('Todo will be moved ...')
      expectErrorMessage('Entry is required.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })

    it('should announce and display error messages when moving item to after with invalid input', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.AFTER)
      await selectAfter('invalid')
      expectFlashMessage('Todo cannot be moved to an invalid position.')

      await submitModal()
      expectErrorMessage('Entry is invalid.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })

    it('should announce and display error messages when moving item to before with invalid input', async () => {
      await openModalFromList(2)

      await selectMoveAction(DragAndDropMoveOptions.BEFORE)
      await selectBefore('invalid')
      expectFlashMessage('Todo cannot be moved to an invalid position.')

      await submitModal()
      expectErrorMessage('Entry is invalid.')
      expect(screen.getByTestId('drag-and-drop-move-modal-position-input')).toHaveFocus()
    })
  })

  describe('Flash message', () => {
    describe('Move to row', () => {
      it('should update first row to next row', async () => {
        await openModalFromList(1)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(2)

        expectFlashMessage("In progress will be between Todo and Won't do.")
      })

      it('should update last row to previous row', async () => {
        await openModalFromList(5)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(4)

        expectFlashMessage("Done will be between Won't do and Blocked.")
      })

      it('should update when middle row to next row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(4)

        expectFlashMessage("Won't do will be between Blocked and Done.")
      })

      it('should update when middle row to previous row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(2)

        expectFlashMessage("Won't do will be between In progress and Todo.")
      })

      it('should update when middle row to first row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(1)

        expectFlashMessage("Won't do will be first item in the list.")
      })

      it('should update when middle row to last row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.ROW)
        await selectRow(5)

        expectFlashMessage("Won't do will be last item in the list.")
      })
    })

    describe('Move item before', () => {
      it('should update first row to next row', async () => {
        await openModalFromList(1)

        await selectMoveAction(DragAndDropMoveOptions.BEFORE)
        await selectBefore("Won't do")

        expectFlashMessage("In progress will be between Todo and Won't do.")
      })

      it('should update last row to previous row', async () => {
        await openModalFromList(5)

        await selectMoveAction(DragAndDropMoveOptions.BEFORE)
        await selectBefore('Blocked')

        expectFlashMessage("Done will be between Won't do and Blocked.")
      })

      it('should update when middle row to next row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.BEFORE)
        await selectBefore('Done')

        expectFlashMessage("Won't do will be between Blocked and Done.")
      })

      it('should update when middle row to previous row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.BEFORE)
        await selectBefore('Todo')

        expectFlashMessage("Won't do will be between In progress and Todo.")
      })

      it('should update when middle row to first row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.BEFORE)
        await selectBefore('In progress')

        expectFlashMessage("Won't do will be first item in the list.")
      })
    })

    describe('Move item after', () => {
      it('should update first row to next row', async () => {
        await openModalFromList(1)

        await selectMoveAction(DragAndDropMoveOptions.AFTER)
        await selectAfter('Todo')

        expectFlashMessage("In progress will be between Todo and Won't do.")
      })

      it('should update last row to previous row', async () => {
        await openModalFromList(5)

        await selectMoveAction(DragAndDropMoveOptions.AFTER)
        await selectAfter("Won't do")

        expectFlashMessage("Done will be between Won't do and Blocked.")
      })

      it('should update when middle row to next row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.AFTER)
        await selectAfter('Blocked')

        expectFlashMessage("Won't do will be between Blocked and Done.")
      })

      it('should update when middle row to previous row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.AFTER)
        await selectAfter('In progress')

        expectFlashMessage("Won't do will be between In progress and Todo.")
      })

      it('should update when middle row to last row', async () => {
        await openModalFromList(3)

        await selectMoveAction(DragAndDropMoveOptions.AFTER)
        await selectAfter('Done')

        expectFlashMessage("Won't do will be last item in the list.")
      })
    })
  })
})
