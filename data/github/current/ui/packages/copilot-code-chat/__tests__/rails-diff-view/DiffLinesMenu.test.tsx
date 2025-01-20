import {sendEvent} from '@github-ui/hydro-analytics'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {DiffLinesMenu} from '../../diff-view/rails/DiffLinesMenu'
import {MockFileDiffReference} from '../__utils__/mock-data'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    ...jest.requireActual('@github-ui/hydro-analytics'),
    sendEvent: jest.fn(),
  }
})

describe('DiffLinesMenu', () => {
  beforeAll(() => {
    // @ts-expect-error overriding window.location in test
    delete window.location
    window.location = {} as Location
    Object.defineProperty(window.location, 'hash', {
      get: () => `${MockFileDiffReference.id}L1-R1`,
    })
  })

  test('Renders partial', async () => {
    const {user} = render(
      <>
        <div className="selected-line selected-line-top blob-code" />
        <DiffLinesMenu fileDiffReference={MockFileDiffReference} />
      </>,
    )

    // click main discuss button
    const button = screen.getByTestId('copilot-ask-menu')
    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(sendEvent).toHaveBeenCalledWith('copilot.file-diff.discuss')

    // open icebreaker button
    const icebreakerMenu = screen.getByTestId('more-copilot-button')
    expect(icebreakerMenu).toBeInTheDocument()

    // attach to thread
    await user.click(screen.getByTestId('more-copilot-button'))
    const attachItem = screen.queryByText('Attach to current thread')
    expect(attachItem).toBeInTheDocument()
    await user.click(attachItem as HTMLElement)
    expect(sendEvent).toHaveBeenCalledWith('copilot.file-diff.add', undefined)

    // explain intent
    await user.click(screen.getByTestId('more-copilot-button'))
    const explainItem = screen.queryByText('Explain')
    expect(explainItem).toBeInTheDocument()
    await user.click(explainItem as HTMLElement)
    expect(sendEvent).toHaveBeenCalledWith('copilot.file-diff.explain', undefined)
  })
})
