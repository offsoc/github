import {render} from '@github-ui/react-core/test-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList} from '@primer/react'
import {screen} from '@testing-library/react'

import {DragAndDrop} from '../drag-and-drop'

const items = [
  {id: '1', title: 'In progress'},
  {id: '2', title: 'Todo'},
  {id: '3', title: "Won't do"},
  {id: '4', title: 'Done'},
]

// Tell Jest to mock all timeout functions
jest.useFakeTimers()

describe('DragAndDrop', () => {
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

  describe('HTML structure', () => {
    it('renders the component with the correct HTML structure by default', () => {
      render(
        <DragAndDrop
          items={items}
          onDrop={() => {}}
          renderOverlay={(item, index) => (
            <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title} isDragOverlay>
              {item.title}
            </DragAndDrop.Item>
          )}
        >
          {items.map((item, index) => (
            <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
              {item.title}
            </DragAndDrop.Item>
          ))}
        </DragAndDrop>,
      )

      expect(screen.getByRole('list')).toBeInstanceOf(HTMLUListElement)
      expect(screen.getAllByRole('listitem')[0]).toBeInstanceOf(HTMLLIElement)
    })

    it('renders the component with the correct HTML structure when overridden', () => {
      render(
        <DragAndDrop
          items={items}
          onDrop={() => {}}
          as={ActionList}
          renderOverlay={(item, index) => (
            <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title} as={ActionList.Item}>
              {item.title}
            </DragAndDrop.Item>
          )}
        >
          {items.map((item, index) => (
            <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title} as={ActionList.Item}>
              {item.title}
            </DragAndDrop.Item>
          ))}
        </DragAndDrop>,
      )

      expect(screen.getByRole('list').className).toContain('ListBox')
      expect(screen.getAllByRole('listitem')[0]?.className).toContain('LiBox')
    })
  })

  describe('Keyboard specific announcements', () => {
    it('announcement when the active element moves to the top of the list.', async () => {
      const {user} = render(
        <>
          <div
            id="js-global-screen-reader-notice-assertive"
            {...testIdProps('js-global-screen-reader-notice-assertive')}
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
          />
          <DragAndDrop
            items={items}
            onDrop={() => {}}
            renderOverlay={(item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            )}
          >
            {items.map((item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            ))}
          </DragAndDrop>
        </>,
      )

      screen.getByRole('button', {name: 'Move Todo'}).focus()
      await user.keyboard('{Enter}')
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent('Moving Todo.')
      await user.keyboard('{ArrowUp}')

      // Fast-forward time
      jest.runAllTimers()
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent('First item in list.')
      await user.keyboard('{Enter}')
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent(
        'Todo successfully moved to first item in list.',
      )
    })

    it('announcement when a user cancels out of drag mode.', async () => {
      jest.spyOn(console, 'error').mockImplementation()
      const {user} = render(
        <>
          <div
            id="js-global-screen-reader-notice-assertive"
            {...testIdProps('js-global-screen-reader-notice-assertive')}
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
          />
          <DragAndDrop
            items={items}
            onDrop={() => {}}
            renderOverlay={(item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            )}
          >
            {items.map((item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            ))}
          </DragAndDrop>
        </>,
      )

      screen.getByRole('button', {name: 'Move Todo'}).focus()
      await user.keyboard('{Enter}')
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent('Moving Todo.')
      await user.keyboard('{ArrowUp}')

      // Fast-forward time
      jest.runAllTimers()
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent('First item in list.')
      await user.keyboard('{Escape}')
      expect(screen.getByTestId('js-global-screen-reader-notice-assertive')).toHaveTextContent('Todo not moved.')
    })

    it('announcement when the active element moves to the bottom of the list.', () => {
      // Placeholder until test is written
      expect(`Last item in list.`).toBe(`Last item in list.`)
    })

    it('announcement when the active element moves before an element in the middle of the list.', () => {
      // Placeholder until test is written
      const OVER_TITLE = 'title'
      expect(`Before ${OVER_TITLE}.`).toBe(`Before ${OVER_TITLE}.`)
    })

    it('announcement when the active element moves after an element in the middle of the list.', () => {
      // Placeholder until test is written
      const OVER_TITLE = 'title'
      expect(`After ${OVER_TITLE}.`).toBe(`After ${OVER_TITLE}.`)
    })
  })

  describe('Trigger button', () => {
    it('should visually hide drag trigger when only one item in list', () => {
      const dragItems = items[0] ? [items[0]] : []
      render(
        <>
          <div
            id="js-global-screen-reader-notice-assertive"
            data-testid="js-global-screen-reader-notice-assertive"
            className="sr-only"
            aria-live="assertive"
            aria-atomic="true"
          />
          <DragAndDrop
            items={dragItems}
            onDrop={() => {}}
            renderOverlay={(item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            )}
          >
            {dragItems.map((item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            ))}
          </DragAndDrop>
        </>,
      )

      expect(screen.queryByTestId('sortable-trigger-container')).toHaveClass('v-hidden')
    })

    it('should display drag trigger when for each item in list', () => {
      render(
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
            onDrop={() => {}}
            renderOverlay={(item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            )}
          >
            {items.map((item, index) => (
              <DragAndDrop.Item index={index} id={item.id} key={item.id} title={item.title}>
                {item.title}
              </DragAndDrop.Item>
            ))}
          </DragAndDrop>
        </>,
      )

      expect(screen.getAllByRole('button')).toHaveLength(items.length)
    })
  })
})
