import {workerSrc} from '../alive'

// mock isStaff() to be true
jest.mock('@github-ui/stats', () => ({
  isStaff: () => true,
  sendStats: () => true,
}))

describe('workerSrc', () => {
  it('returns null when no shared-web-socket-src link is present', () => {
    document.head.textContent = ''
    expect(workerSrc()).toBeNull()
  })

  it('returns the href of the shared-web-socket-src link when it is valid', () => {
    document.head.innerHTML = '<link rel="shared-web-socket-src" href="/worker.js">'
    expect(workerSrc()).toBe('/worker.js')
  })

  it('returns null when the shared-web-socket-src link has an invalid URL', () => {
    document.head.innerHTML = '<link rel="shared-web-socket-src" href="https://hacker.net/worker.js">'
    expect(workerSrc()).toBeNull()
  })
})
