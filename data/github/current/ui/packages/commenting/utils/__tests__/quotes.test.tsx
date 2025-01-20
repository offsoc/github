import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {CLASS_NAMES, IDS} from '../../constants/dom-elements'
import {getQuotedText, selectQuoteFromComment} from '../quotes'

describe('getQuotedText', () => {
  test('returns no quotes on empty text', () => {
    const quote = getQuotedText('')

    expect(quote).toBe('')
  })

  test('returns text with a ">" prefix and leading new line for non-empty strings', () => {
    const quote = getQuotedText('cool beans')

    expect(quote).toMatchInlineSnapshot(`
    "> cool beans
    "
  `)
  })

  test('returns text with a ">" prefix for a complex usage', () => {
    const quote = getQuotedText(`test me
test me
test me
- [x] test me
- [ ] test me

<details>
hello
</details>

![github](https://avatars.githubusercontent.com/u/9919?s=200&v=4)

\`\`\`js
function hackerMan() {
  return "I'm in";
}
\`\`\``)

    expect(quote).toMatchInlineSnapshot(`
    "> test me
    > test me
    > test me
    > - [x] test me
    > - [ ] test me
    > 
    > <details>
    > hello
    > </details>
    > 
    > ![github](https://avatars.githubusercontent.com/u/9919?s=200&v=4)
    > 
    > \`\`\`js
    > function hackerMan() {
    >   return "I'm in";
    > }
    > \`\`\`
    "
  `)
  })
})

describe('selectQuoteFromComment', () => {
  test('returns undefined if comment is not provided', () => {
    const quote = selectQuoteFromComment(null, null)

    expect(quote).toBeUndefined()
  })

  test('inserts quoted selection into textarea', async () => {
    setup(<p>original comment</p>)

    const comment: HTMLDivElement = screen.getByTestId('comment')
    const textArea = screen.getByTestId('comment-textarea')
    const quote = selectQuoteFromComment(comment, null)
    expect(quote).toEqual(`> original comment

`)
    expect(textArea).toHaveValue(quote)
  })

  test('ignores hidden elements', () => {
    setup(
      <p>
        original comment<span style={{display: 'none'}}> do not quote me</span>
      </p>,
    )

    const comment: HTMLDivElement = screen.getByTestId('comment')
    const quote = selectQuoteFromComment(comment, null)
    expect(quote).toEqual(`> original comment

`)
  })

  test('swaps assets with presigned assets', () => {
    const presigned = '![github](https://github.com/repo/user/9919.png)'
    const presigned2 = '![hello world.png](https://github.com/repo/user/9918-abs2)'
    const plainContent = 'some [[ideas] about ![stuff] (hey) and ![also](this)'
    const commentBodyContent = `
${plainContent}
${presigned}
${presigned2}
`
    setup(
      <>
        <p>{plainContent}</p>
        <img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" alt="github" />
        <img src="https://avatars.githubusercontent.com/u/9918-abs2.png?s=200&v=4" alt="github" />
      </>,
    )
    const comment: HTMLDivElement = screen.getByTestId('comment')
    const quote = selectQuoteFromComment(comment, null, commentBodyContent)
    expect(quote).toEqual(`> ${plainContent}${presigned}${presigned2}

`)
  })

  test('works if selection does not contain assets', () => {
    const presigned = '![github](https://github.com/repo/user/9919.png)'
    const plainContent = 'some [[ideas] about ![stuff] (hey) and ![also](this)'
    const commentBodyContent = `
${plainContent}
${presigned}
`
    setup(<p>{plainContent}</p>)
    const comment: HTMLDivElement = screen.getByTestId('comment')
    const quote = selectQuoteFromComment(comment, null, commentBodyContent)
    expect(quote).toEqual(`> ${plainContent}

`)
  })

  test('works with multiples of the same asset', () => {
    const presigned = '![github](https://github.com/repo/user/9919.png)'
    const presigned2 = '![hello world.png](https://github.com/repo/user/9918-abs2)'
    const plainContent = 'some [[ideas] about ![stuff] /repo/user (hey) and ![also](this)'
    const commentBodyContent = `
${plainContent}
${presigned}
${presigned2}
${plainContent}
${presigned}
`
    setup(
      <>
        <p>{plainContent}</p>
        <img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" alt="github" />
        <img src="https://avatars.githubusercontent.com/u/9918-abs2.png?s=200&v=4" alt="github" />
        <img src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" alt="github" />
      </>,
    )
    const comment: HTMLDivElement = screen.getByTestId('comment')
    const quote = selectQuoteFromComment(comment, null, commentBodyContent)
    expect(quote).toEqual(`> ${plainContent}${presigned}${presigned2}${presigned}

`)
  })
})

const setup = (markdownBodyInner: JSX.Element) =>
  render(
    <div className={CLASS_NAMES.commentsContainer} data-testid="comment">
      <div className={CLASS_NAMES.markdownBody}>{markdownBodyInner}</div>
      <div id={IDS.issueCommentComposer}>
        <textarea data-testid="comment-textarea" />
      </div>
    </div>,
  )
