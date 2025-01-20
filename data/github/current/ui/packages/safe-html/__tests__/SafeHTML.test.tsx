import {render, screen} from '@testing-library/react'
import DOMPurify from 'dompurify'

import type {SafeHTMLString} from '../SafeHTML'
import {SafeHTMLBox, SafeHTMLText} from '../SafeHTML'

const unsafeHTML = '<p>this is unsafe<script>alert("Oh no!")</script></p>'
const safeHTML = '<p>this is safe</p>' as SafeHTMLString

const baseDOMPurifyConfig = {
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
} as const

jest.mock('dompurify')
DOMPurify.sanitize = jest.fn().mockImplementation(html => html)

/**
 * This function exists to make sure that these elements compile or fail to
 * compile as appropriate. It is correct for it to be unused.
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function testTypes() {
  return (
    <>
      {/* Anything can go in unverifiedHTML because we will run it through DOMPurify */}
      <SafeHTMLText unverifiedHTML={unsafeHTML} />

      {/* HTML strings we've marked as verified can go in the html prop */}
      <SafeHTMLText html={safeHTML} />

      {/* Safe html strings can go in unverifiedHTML, but they will be run through DOMPurify */}
      <SafeHTMLText unverifiedHTML={safeHTML} />

      {/* @ts-expect-error Unsafe html strings cannot be put in the html prop */}
      <SafeHTMLText html={unsafeHTML} />

      {/* @ts-expect-error A safe string concatenated with an unsafe string has type `string` so it is considered unsafe */}
      <SafeHTMLText html={safeHTML + unsafeHTML} />

      {/* @ts-expect-error Trying to supply both is an error */}
      <SafeHTMLText html={safeHTML} unverifiedHTML={unsafeHTML} />

      {/* Same tests for SafeHTMLBox */}
      <SafeHTMLBox unverifiedHTML={unsafeHTML} />
      <SafeHTMLBox html={safeHTML} />
      <SafeHTMLBox unverifiedHTML={safeHTML} />
      {/* @ts-expect-error unsafe html not allowed in `html` */}
      <SafeHTMLBox html={unsafeHTML} />
      {/* @ts-expect-error unsafe html not allowed in `html` */}
      <SafeHTMLBox html={safeHTML + unsafeHTML} />
      {/* @ts-expect-error both not allowed */}
      <SafeHTMLBox html={safeHTML} unverifiedHTML={unsafeHTML} />
    </>
  )
}

test('`html` renders the provided html string without passing it through DOMPurify', () => {
  render(<SafeHTMLText html={safeHTML} />)
  expect(screen.getByText('this is safe')).toBeInTheDocument()
  expect(DOMPurify.sanitize).not.toHaveBeenCalled()
})

describe('`unverifiedHTML`', () => {
  test('renders the provided html string and passes it through DOMPurify', () => {
    render(<SafeHTMLText unverifiedHTML={unsafeHTML} />)
    expect(screen.getByText('this is unsafe')).toBeInTheDocument()
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(unsafeHTML, baseDOMPurifyConfig)
  })

  test('passes `unverifiedHTMLConfig` to DOMPurify', () => {
    render(<SafeHTMLText unverifiedHTML={unsafeHTML} unverifiedHTMLConfig={{ALLOWED_TAGS: ['p']}} />)
    expect(screen.getByText('this is unsafe')).toBeInTheDocument()
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(unsafeHTML, {...baseDOMPurifyConfig, ALLOWED_TAGS: ['p']})
  })
})
