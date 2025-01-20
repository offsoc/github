import {isMacOS} from '@github-ui/get-os'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, renderHook, screen} from '@testing-library/react'

import {useIgnoreKeyboardActionsWhileComposing} from '../use-ignore-keyboard-actions-while-composing'

jest.mock('@github-ui/get-os')

describe('useIgnoreKeyboardActionsWhileComposing', () => {
  beforeEach(() => {
    const isMacOSMock = isMacOS as jest.Mock
    isMacOSMock.mockReturnValue(false)
  })

  it('should allow typing when no composition occurs', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'ime composition')

    expect(screen.getByRole('textbox')).toHaveValue('ime composition')
  })

  it('should allow typing when composition occurs', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    fireEvent.compositionEnd(textarea)

    expect(screen.getByRole('textbox')).toHaveValue('ime composition')
  })

  it('should ignore unprintable `229` keydown event typing after composition end on macOS', async () => {
    const isMacOSMock = isMacOS as jest.Mock
    isMacOSMock.mockReturnValue(true)

    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    fireEvent.compositionEnd(textarea)
    onKeyDown.mockReset()
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.keyDown(textarea, {keyCode: 229})

    expect(screen.getByRole('textbox')).toHaveValue('ime composition')
    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('should not ignore unprintable `229` keydown event typing after composition ends not on macOS', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    fireEvent.compositionEnd(textarea)
    onKeyDown.mockReset()
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.keyDown(textarea, {keyCode: 229})

    expect(screen.getByRole('textbox')).toHaveValue('ime composition')
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should not ignore unprintable `229` keydown event typing before composition ends not on macOS', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    onKeyDown.mockReset()
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.keyDown(textarea, {keyCode: 229})
    fireEvent.compositionEnd(textarea)

    expect(screen.getByRole('textbox')).toHaveValue('ime composition')
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should ignore Enter keydown event before composition ends', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    onKeyDown.mockReset()
    await user.type(textarea, '{enter}')

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('should not ignore Enter keydown event after composition ends', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    fireEvent.compositionEnd(textarea)
    onKeyDown.mockReset()
    await user.type(textarea, '{enter}')

    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should ignore Tab keydown event before composition ends', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    onKeyDown.mockReset()
    await user.type(textarea, '{tab}')

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('should not ignore Tab keydown event after composition ends', async () => {
    const onKeyDown = jest.fn()
    const {result} = renderHook(() => useIgnoreKeyboardActionsWhileComposing(onKeyDown))

    const {user} = render(<textarea {...result.current} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'ime composition')
    fireEvent.compositionEnd(textarea)
    onKeyDown.mockReset()
    await user.type(textarea, '{tab}')

    expect(onKeyDown).toHaveBeenCalled()
  })
})
