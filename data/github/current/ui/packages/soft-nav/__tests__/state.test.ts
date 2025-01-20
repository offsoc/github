import {getItem, setItem} from '@github-ui/safe-storage/session-storage'
import {SoftNavEndEvent, SoftNavErrorEvent, SoftNavStartEvent, SoftNavSuccessEvent} from '../events'
import {
  initSoftNav,
  startSoftNav,
  succeedSoftNav,
  failSoftNav,
  endSoftNav,
  renderedSoftNav,
  updateFrame,
} from '../state'
import {SOFT_NAV_STATE} from '../states'
import {SOFT_NAV_DURATION_MARK} from '../stats'
import {
  clearSoftNav,
  setSoftNavMechanism,
  setSoftNavReactAppName,
  SOFT_NAV_FAIL,
  SOFT_NAV_FAIL_REFERRER,
  SOFT_NAV_MARK,
  SOFT_NAV_REACT_APP_NAME,
  SOFT_NAV_REFERRER,
} from '../utils'

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.clearResourceTimings = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])

const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')

jest.mock('@github-ui/stats', () => ({
  sendStats: jest.fn(),
}))

describe('soft-nav state', () => {
  afterEach(() => {
    jest.clearAllMocks()
    clearSoftNav()
  })

  describe('initSoftNav', () => {
    it('dispatches a init event', () => {
      initSoftNav()

      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.INITIAL))
    })

    it('resets the local storage', () => {
      initSoftNav()

      expect(getItem(SOFT_NAV_MARK)).toBe('0')
      expect(getItem(SOFT_NAV_REFERRER)).toBeNull()
      expect(getItem(SOFT_NAV_FAIL)).toBeNull()
      expect(getItem(SOFT_NAV_FAIL_REFERRER)).toBeNull()
      expect(getItem(SOFT_NAV_REACT_APP_NAME)).toBeNull()
    })
  })

  describe('startSoftNav', () => {
    it('starts the progress bar', () => {
      startSoftNav('turbo')

      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.START))
    })

    it('dispatches a start event', () => {
      startSoftNav('turbo')

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavStartEvent))
    })

    it('sets the mechanism', () => {
      startSoftNav('turbo')

      expect(getItem(SOFT_NAV_MARK)).toBe('turbo')
    })

    it('sets the react app name if an app is present', () => {
      const app = document.createElement('react-app')
      app.setAttribute('app-name', 'react-app')
      document.body.append(app)

      startSoftNav('turbo')

      expect(getItem(SOFT_NAV_REACT_APP_NAME)).toBe('react-app')

      app.remove()
    })

    it('clears the react app name if an app is not present', () => {
      setItem(SOFT_NAV_REACT_APP_NAME, 'react-app')
      startSoftNav('turbo')

      expect(getItem(SOFT_NAV_REACT_APP_NAME)).toBeNull()
    })

    it('sets the referrer', () => {
      startSoftNav('turbo')

      expect(getItem(SOFT_NAV_REFERRER)).toBe(window.location.href)
    })

    it('marks the start time', () => {
      startSoftNav('turbo')

      expect(window.performance.mark).toHaveBeenCalledWith(SOFT_NAV_DURATION_MARK)
    })
  })

  describe('succeedSoftNav', () => {
    describe('when a soft-nav is not in progress', () => {
      it('does not dispatch any events', () => {
        succeedSoftNav()

        expect(dispatchEventSpy).not.toHaveBeenCalled()
      })
    })

    describe('when a soft-nav is in progress', () => {
      beforeEach(() => {
        startSoftNav('turbo')
        jest.clearAllMocks()
      })

      it('dispatches a success and end events', () => {
        succeedSoftNav()

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavSuccessEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
      })

      it('does not dispatch an event if the mechanism is not allowed', () => {
        setSoftNavMechanism('react')
        succeedSoftNav({allowedMechanisms: ['turbo']})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavSuccessEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
      })

      it('does not dispatch an event if explicitly skipping when going to a react app', () => {
        const app = document.createElement('react-app')
        app.setAttribute('app-name', 'react-app')
        document.body.append(app)

        setSoftNavReactAppName()
        succeedSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavSuccessEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavEndEvent))

        app.remove()
      })

      it('dispatches events if skipping react apps but no app is present', () => {
        setSoftNavReactAppName()
        succeedSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavSuccessEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
      })
    })
  })

  describe('failSoftNav', () => {
    describe('when a soft-nav is not in progress', () => {
      it('does not dispatch any events', () => {
        failSoftNav()

        expect(dispatchEventSpy).not.toHaveBeenCalled()
      })
    })

    describe('when a soft-nav is in progress', () => {
      beforeEach(() => {
        startSoftNav('turbo')
        jest.clearAllMocks()
      })

      it('dispatches error and progressbar end events', () => {
        failSoftNav()

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavErrorEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })

      it('resets the local storage', () => {
        initSoftNav()

        expect(getItem(SOFT_NAV_MARK)).toBe('0')
        expect(getItem(SOFT_NAV_REFERRER)).toBeNull()
        expect(getItem(SOFT_NAV_FAIL)).toBeNull()
        expect(getItem(SOFT_NAV_FAIL_REFERRER)).toBeNull()
        expect(getItem(SOFT_NAV_REACT_APP_NAME)).toBeNull()
      })

      it('does not dispatch an event if the mechanism is not allowed', () => {
        setSoftNavMechanism('react')
        failSoftNav({allowedMechanisms: ['turbo']})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavErrorEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })

      it('does not dispatch an event if explicitly skipping when going to a react app', () => {
        const app = document.createElement('react-app')
        app.setAttribute('app-name', 'react-app')
        document.body.append(app)

        setSoftNavReactAppName()
        failSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavErrorEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))

        app.remove()
      })

      it('dispatches events if skipping react apps but no app is present', () => {
        setSoftNavReactAppName()
        failSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavErrorEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })
    })
  })

  describe('endSoftNav', () => {
    describe('when a soft-nav is not in progress', () => {
      it('does not dispatch any events', () => {
        endSoftNav()

        expect(dispatchEventSpy).not.toHaveBeenCalled()
      })
    })

    describe('when a soft-nav is in progress', () => {
      beforeEach(() => {
        startSoftNav('turbo')
        jest.clearAllMocks()
      })

      it('dispatches end and progress bar end events', () => {
        endSoftNav()

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })

      it('does not dispatch an event if the mechanism is not allowed', () => {
        setSoftNavMechanism('react')
        endSoftNav({allowedMechanisms: ['turbo']})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })

      it('does not dispatch an event if explicitly skipping when going to a react app', () => {
        const app = document.createElement('react-app')
        app.setAttribute('app-name', 'react-app')
        document.body.append(app)

        setSoftNavReactAppName()
        endSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))

        app.remove()
      })

      it('dispatches events if skipping react apps but no app is present', () => {
        setSoftNavReactAppName()
        endSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavEndEvent))
        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
      })

      it('unsets the soft nav', () => {
        endSoftNav()

        expect(getItem(SOFT_NAV_MARK)).toBe('0')
      })
    })
  })

  describe('renderedSoftNav', () => {
    describe('when a soft-nav is not in progress', () => {
      it('does not dispatch any events', () => {
        renderedSoftNav()

        expect(dispatchEventSpy).not.toHaveBeenCalled()
      })
    })

    describe('when a soft-nav is in progress', () => {
      beforeEach(() => {
        startSoftNav('turbo')
        jest.clearAllMocks()
      })

      it('dispatches a render event', () => {
        renderedSoftNav()

        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.RENDER))
      })

      it('does not dispatch an event if the mechanism is not allowed', () => {
        setSoftNavMechanism('react')
        renderedSoftNav({allowedMechanisms: ['turbo']})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.RENDER))
      })

      it('does not dispatch an event if explicitly skipping when going to a react app', () => {
        const app = document.createElement('react-app')
        app.setAttribute('app-name', 'react-app')
        document.body.append(app)

        setSoftNavReactAppName()
        renderedSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).not.toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.RENDER))

        app.remove()
      })

      it('dispatches events if skipping react apps but no app is present', () => {
        setSoftNavReactAppName()
        renderedSoftNav({skipIfGoingToReactApp: true})

        expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.RENDER))
      })
    })
  })

  describe('updateFrame', () => {
    it('dispatches an event', () => {
      updateFrame()

      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event(SOFT_NAV_STATE.FRAME_UPDATE))
    })
  })
})
