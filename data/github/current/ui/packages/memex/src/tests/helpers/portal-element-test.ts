import {getActivePortalIds, isInsidePortal, isPortalActive} from '../../client/helpers/portal-elements'

describe('portal-element', () => {
  describe('isPortalActive', () => {
    it('returns false when page is empty', () => {
      document.body.innerHTML = `<div></div>`

      expect(isPortalActive()).toBeFalsy()
    })

    describe('for primer root', () => {
      it('returns false when element exists but no child nodes', () => {
        document.body.innerHTML = `<div>
        <div id='__primerPortalRoot__'></div>
        </div>`

        expect(isPortalActive()).toBeFalsy()
      })

      it('returns true when element exists and has child nodes', () => {
        document.body.innerHTML = `<div>
          <div id='__primerPortalRoot__'>
            <div class='content'>body</div>
          </div>
        </div>`

        expect(isPortalActive()).toBeTruthy()
      })
    })

    describe(`for element matching '-portal-root' suffix`, () => {
      it('returns false when element exists but no child nodes', () => {
        document.body.innerHTML = `<div>
        <div id='column-option-portal-root'></div>
        </div>`

        expect(isPortalActive()).toBeFalsy()
      })

      it('returns true when element exists and has child nodes', () => {
        document.body.innerHTML = `<div>
          <div id='table-portal-root'>
            <div class='content'>body</div>
          </div>
        </div>`

        expect(isPortalActive()).toBeTruthy()
      })
    })
  })

  describe('isInsidePortal', () => {
    it('returns false for null or undefined', () => {
      expect(isInsidePortal(null)).toBeFalsy()
      expect(isInsidePortal(undefined)).toBeFalsy()
    })

    it('returns false when element not in a known portal', () => {
      const element = document.createElement('div')
      expect(isInsidePortal(element)).toBeFalsy()
    })

    it('returns false for parent element of portal', () => {
      document.body.innerHTML = `
      <div>
        <div id='root'>
          <div id='table-portal-root'>
            <div class='content'>body</div>
          </div>
        </div>
      </div>`

      const element = document.getElementById('root')

      expect(isInsidePortal(element)).toBeFalsy()
    })

    it('returns true for element as child of primer portal root', () => {
      document.body.innerHTML = `<div>
          <div id='__primerPortalRoot__'>
            <div id='some-child'>body</div>
          </div>
        </div>`

      const element = document.getElementById('some-child')

      expect(isInsidePortal(element)).toBeTruthy()
    })

    it(`returns true when element matches '-portal-root' suffix and has child nodes`, () => {
      document.body.innerHTML = `<div>
          <div id='table-portal-root'>
            <div id='some-child'>body</div>
          </div>
        </div>`

      const element = document.getElementById('some-child')

      expect(isInsidePortal(element)).toBeTruthy()
    })
  })

  describe('getActivePortalIds', () => {
    it(`returns empty array when no elements found`, () => {
      document.body.innerHTML = `<div></div>`

      expect(getActivePortalIds()).toHaveLength(0)
    })

    it(`returns empty array when portal elements do not have children`, () => {
      document.body.innerHTML = `<div>
          <div id='__primerPortalRoot__'></div>
          <div id='table-portal-root'></div>
          <div id='column-option-portal-root'></div>
        </div>`

      expect(getActivePortalIds()).toHaveLength(0)
    })

    it(`returns array of ids when portal elements have children`, () => {
      document.body.innerHTML = `<div>
          <div id='__primerPortalRoot__'>
            <div class='content'>body</div>
          </div>
          <div id='table-portal-root'>
            <div class='content'>body</div>
          </div>
          <div id='column-option-portal-root'>
            <div class='content'>body</div>
          </div>
        </div>`

      expect(getActivePortalIds()).toMatchObject([
        '__primerPortalRoot__',
        'table-portal-root',
        'column-option-portal-root',
      ])
    })
  })
})
