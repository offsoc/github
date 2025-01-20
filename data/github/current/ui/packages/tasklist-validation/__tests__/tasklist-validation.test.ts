import {hasCustomTitle, validateContent} from '../tasklist-validation'

describe('tasklist-validation', () => {
  describe('hasCustomTitle', () => {
    it('returns true if content has a custom title', () => {
      const content = `
      # Title
      - [ ] item
      `
      expect(hasCustomTitle(content)).toBe(true)
    })

    it('returns false if content does not have a custom title', () => {
      const content = `
      - [ ] item
      `
      expect(hasCustomTitle(content)).toBe(false)
    })

    it('accepts any heading type', () => {
      const contentH2 = `
      ## Title
      - [ ] item
      `
      const contentH3 = `
      ### Title
      - [ ] item
      `
      const contentH4 = `
      #### Title
      - [ ] item
      `

      const contentH5 = `
      ##### Title
      - [ ] item
      `
      const contentH6 = `
      ###### Title
      - [ ] item
      `
      expect(hasCustomTitle(contentH2)).toBe(true)
      expect(hasCustomTitle(contentH3)).toBe(true)
      expect(hasCustomTitle(contentH4)).toBe(true)
      expect(hasCustomTitle(contentH5)).toBe(true)
      expect(hasCustomTitle(contentH6)).toBe(true)
    })

    it('ignores issue references', () => {
      const content = `
      - [ ] #123
      `
      expect(hasCustomTitle(content)).toBe(false)
    })
  })

  describe('validateContent', () => {
    it('formats content that is not a tasklist', () => {
      const content = `
one
two
three
`
      const expectedContent = `
- [ ] one
- [ ] two
- [ ] three
`
      expect(validateContent(content)).toBe(expectedContent)
    })

    it('formats content that is a tasklist with a custom title', () => {
      const content = `
### my title
- [ ] one
- [ ] two
- [ ] three
`
      const expectedContent = `
### my title
- [ ] one
- [ ] two
- [ ] three
`
      expect(validateContent(content)).toBe(expectedContent)
    })

    it('formats content that is not a tasklist but has a custom title', () => {
      const content = `
### my title
one
two
three
`
      const expectedContent = `
### my title
- [ ] one
- [ ] two
- [ ] three
`
      expect(validateContent(content)).toBe(expectedContent)
    })

    it('formats bulleted lists', () => {
      const contentDash = `
- bullet 1
- bullet 2
- bullet 3
`
      const expectedContentDash = `
- [ ] bullet 1
- [ ] bullet 2
- [ ] bullet 3
`
      expect(validateContent(contentDash)).toBe(expectedContentDash)

      const contentStar = `
* bullet 1
* bullet 2
* bullet 3
`
      const expectedContentStart = `
* [ ] bullet 1
* [ ] bullet 2
* [ ] bullet 3
`
      expect(validateContent(contentStar)).toBe(expectedContentStart)
    })

    it('formats a bulleted list with a custom title', () => {
      const content = `
### my title
- bullet 1
- bullet 2
- bullet 3
`
      const expectedContent = `
### my title
- [ ] bullet 1
- [ ] bullet 2
- [ ] bullet 3
`
      expect(validateContent(content)).toBe(expectedContent)
    })
  })
})
