import {ActionsAnnounceableSearchResultSummaryElement} from '../actions-announceable-search-result-summary-element'
import {announceFromElement} from '@github-ui/aria-live'

jest.mock('@github-ui/aria-live', () => ({
  announceFromElement: jest.fn(),
}))

jest.useFakeTimers()

describe('search results summary a11y announcement', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  it('with a non-empty "searchResult" child node: announces search results summary element', async () => {
    const el = new ActionsAnnounceableSearchResultSummaryElement()
    const expectedAnnouncement = 'Found 5 things'

    el.insertAdjacentHTML(
      'afterbegin',
      `<span data-target="actions-announceable-search-result-summary.searchResult">${expectedAnnouncement}</span>`,
    )

    el.connectedCallback()
    jest.runAllTimers()

    expect(el.searchResult).toBeTruthy()
    expect(el.searchResult.textContent).toEqual(expectedAnnouncement)
    expect(announceFromElement).toHaveBeenCalled()
    expect(announceFromElement).toHaveBeenCalledWith(el.searchResult)
  })
})
