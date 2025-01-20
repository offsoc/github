import {isFeatureEnabled} from '@github-ui/feature-flags'
import {type ElementWithAriaNotify, announce, announceFromElement} from '../aria-live'
import type {LiveRegionElement} from '@primer/live-region-element'

jest.mock('@github-ui/feature-flags')

describe('aria-live', () => {
  beforeEach(() => {
    const region = document.createElement('div')
    region.id = 'js-global-screen-reader-notice'
    region.classList.add('sr-only')
    region.setAttribute('aria-live', 'polite')

    const assertiveRegion = document.createElement('div')
    assertiveRegion.id = 'js-global-screen-reader-notice-assertive'
    assertiveRegion.classList.add('sr-only')
    assertiveRegion.setAttribute('aria-live', 'assertive')

    const customRegion = document.createElement('div')
    customRegion.id = 'custom-region'

    document.body.appendChild(assertiveRegion)
    document.body.appendChild(region)
    document.body.appendChild(customRegion)
  })

  afterEach(() => {
    document.querySelector('[aria-live="polite"]')?.remove()
    document.querySelector('[aria-live="assertive"]')?.remove()
    document.querySelector('#custom-region')?.remove()
  })

  test('`announce` adds text to live region', () => {
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('')
    announce('Hello world')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('Hello world')
  })

  test('adds and removes non-breaking space for duplicate text', () => {
    announce('Mona is cute')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('Mona is cute')

    announce('Mona is cute')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('Mona is cute\u00A0')

    announce('Mona is cute')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('Mona is cute')
  })

  test('`announce` adds text to assertive live region', () => {
    announce('Hello world', {assertive: true})
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('')
    expect(document.querySelector('[aria-live="assertive"]')?.textContent).toEqual('Hello world')
    expect(document.querySelector('#custom-region')?.textContent).toEqual('')
  })

  test('`announce` adds text to custom live region', () => {
    announce('Hello world', {element: document.querySelector('#custom-region') as HTMLElement})
    expect(document.querySelector('#custom-region')?.textContent).toEqual('Hello world')
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('')
    expect(document.querySelector('[aria-live="assertive"]')?.textContent).toEqual('')
  })

  describe('with primer_live_region_element flag enabled', () => {
    let liveRegion: LiveRegionElement

    beforeEach(() => {
      liveRegion = document.createElement('live-region')
      liveRegion.delay = 0
      document.body.appendChild(liveRegion)
      ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'primer_live_region_element')
    })

    afterEach(() => {
      liveRegion.remove()
      ;(isFeatureEnabled as jest.Mock).mockClear()
    })

    test('`announce` adds text to live region', () => {
      expect(liveRegion.getMessage('polite')).toEqual('')
      announce('Hello world')
      expect(liveRegion.getMessage('polite')).toEqual('Hello world')
    })

    test('adds and removes non-breaking space for duplicate text', () => {
      announce('Mona is cute')
      expect(liveRegion.getMessage('polite')).toEqual('Mona is cute')

      announce('Mona is cute')
      expect(liveRegion.getMessage('polite')).toEqual('Mona is cute\u00A0')

      announce('Mona is cute')
      expect(liveRegion.getMessage('polite')).toEqual('Mona is cute')
    })

    test('`announce` adds text to assertive live region', () => {
      announce('Hello world', {assertive: true})
      expect(liveRegion.getMessage('polite')).toEqual('')
      expect(liveRegion.getMessage('assertive')).toEqual('Hello world')
      expect(document.querySelector('#custom-region')?.textContent).toEqual('')
    })

    test('`announce` adds text to custom live region', () => {
      announce('Hello world', {element: document.querySelector('#custom-region') as HTMLElement})
      expect(document.querySelector('#custom-region')?.textContent).toEqual('Hello world')
      expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('')
      expect(document.querySelector('[aria-live="assertive"]')?.textContent).toEqual('')
    })

    test('`announceFromElement`adds text to live region', () => {
      const element = document.createElement('div')
      element.setAttribute('aria-label', 'Hello world')
      announceFromElement(element)
      expect(liveRegion.getMessage('polite')).toEqual('Hello world')
    })

    test('`announceFromElement` adds text to custom live region', () => {
      const element = document.createElement('div')
      element.setAttribute('aria-label', 'Hello world')
      announceFromElement(element, {element: document.querySelector('#custom-region') as HTMLElement})
      expect(document.querySelector('#custom-region')?.textContent).toEqual('Hello world')
      expect(document.querySelector('[aria-live="polite"]')?.textContent).toEqual('')
      expect(document.querySelector('[aria-live="assertive"]')?.textContent).toEqual('')
    })
  })
})

describe('with arianotify_comprehensive_migration flag enabled', () => {
  let ariaNotifySpy = (
    _rec: Element,
    _msg: Parameters<ElementWithAriaNotify['ariaNotify']>[0],
    _opts: Parameters<ElementWithAriaNotify['ariaNotify']>[1],
  ) => {}
  beforeEach(() => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'arianotify_comprehensive_migration')
    ariaNotifySpy = jest.fn().mockImplementation(() => {})
    ;(Element.prototype as ElementWithAriaNotify).ariaNotify = function (msg, opts) {
      ariaNotifySpy(this, msg, opts)
    }
  })

  test('`announce` calls ariaNotify', () => {
    announce('Hello world')
    expect(ariaNotifySpy).toHaveBeenCalledWith<Parameters<typeof ariaNotifySpy>>(document.body, 'Hello world', {
      interrupt: 'none',
    })
  })

  test('`announce` calls with the given passed in element', () => {
    const element = document.createElement('div')
    announce('hello', {element})
    expect(ariaNotifySpy).toHaveBeenCalledWith<Parameters<typeof ariaNotifySpy>>(element, 'hello', {
      interrupt: 'none',
    })
  })

  test('`announce` calls with interrupt: all if assertive', () => {
    const element = document.createElement('div')
    announce('hello', {assertive: true, element})
    expect(ariaNotifySpy).toHaveBeenCalledWith<Parameters<typeof ariaNotifySpy>>(element, 'hello', {
      interrupt: 'all',
    })
  })

  test('`announceFromElement`adds text to live region', () => {
    const element = document.createElement('div')
    element.setAttribute('aria-label', 'Hello world')
    announceFromElement(element)
    expect(ariaNotifySpy).toHaveBeenCalledWith<Parameters<typeof ariaNotifySpy>>(element, 'Hello world', {
      interrupt: 'none',
    })
  })
})
