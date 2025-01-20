import {setTitle} from '../document-metadata'
import {announce} from '@github-ui/aria-live'

jest.mock('@github-ui/aria-live', () => ({
  announce: jest.fn(),
}))

describe('setTitle in browser', () => {
  afterEach(() => {
    jest.resetAllMocks()
    document.title = ''
  })
  it('changes the title element', () => {
    document.title = 'foo'

    setTitle('bar')
    expect(document.title).toEqual('bar')
  })

  it('creates a title element if none is present', () => {
    document.querySelector('title')?.remove()

    setTitle('bar')
    expect(document.querySelector('title')?.textContent).toEqual('bar')
  })

  it('creates a new title element instead of updating the existing one', () => {
    document.title = 'foo'
    const oldTitle = document.querySelector('title')

    setTitle('bar')

    const newTitle = document.querySelector('title')

    expect(oldTitle).not.toBe(newTitle)
  })

  it("doesn't create a new title element if the new title text is the same as the old title", () => {
    document.title = 'foo'
    const oldTitle = document.querySelector('title')

    setTitle('foo')

    const newTitle = document.querySelector('title')

    expect(oldTitle).toBe(newTitle)
  })

  it('announces the new title', () => {
    setTitle('foo')

    expect(announce).toHaveBeenCalledWith('foo')
  })

  it("doesn't announces the new title if it is the same as the old title", () => {
    document.title = 'foo'
    setTitle('foo')

    expect(announce).not.toHaveBeenCalled()
  })
})
