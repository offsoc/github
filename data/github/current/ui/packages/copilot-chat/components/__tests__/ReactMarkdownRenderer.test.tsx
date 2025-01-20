import {render, screen} from '@testing-library/react'

import {
  ReactMarkdownRenderer,
  reactReplaceElementPrefix,
  replaceStringsWithReactContainers,
} from '../ReactMarkdownRenderer'

// set Math.random to a fixed value
const mockMath = Object.create(global.Math)
mockMath.random = () => 1

describe('ReactMarkdownRenderer', () => {
  it('replaces patterns with elements', () => {
    const reactReplaceBlocks = {
      bold: {
        regex: /(\*\*.*?\*\*)/g,
        renderer: (match: string) => <b>{match}</b>,
      },
      italic: {
        regex: /(_.*?_)/g,
        renderer: (match: string) => <i>{match}</i>,
      },
    }

    const body = 'This is a **bold** and _italic_ text.'
    const {matches, output} = replaceStringsWithReactContainers(reactReplaceBlocks, '0', body)
    expect(output).toBe(
      `This is a <span id="${reactReplaceElementPrefix}-0-0"></span> and <span id="${reactReplaceElementPrefix}-1-0"></span> text.`,
    )
    expect(matches).toEqual([
      {id: `${reactReplaceElementPrefix}-0-0`, componentType: 'bold', matchedContent: '**bold**'},
      {id: `${reactReplaceElementPrefix}-1-0`, componentType: 'italic', matchedContent: '_italic_'},
    ])
  })

  it('renders into replaced elements', () => {
    const reactReplaceBlocks = {
      bold: {
        regex: /(\*\*.*?\*\*)/g,
        renderer: (match: string) => <b>{match}</b>,
      },
      italic: {
        regex: /(_.*?_)/g,
        renderer: (match: string) => <i>{match}</i>,
      },
    }

    const body = `This is a <span id="${reactReplaceElementPrefix}-0-0"></span> and <span id="${reactReplaceElementPrefix}-1-0"></span> text.`
    const matches = [
      {id: `${reactReplaceElementPrefix}-0-0`, componentType: 'bold', matchedContent: '**bold**'},
      {id: `${reactReplaceElementPrefix}-1-0`, componentType: 'italic', matchedContent: '_italic_'},
    ]

    const {rerender} = render(
      <ReactMarkdownRenderer body={body} matches={matches} reactReplaceBlocks={reactReplaceBlocks} />,
    )
    rerender(<ReactMarkdownRenderer body={body} matches={matches} reactReplaceBlocks={reactReplaceBlocks} />)

    expect(screen.getByText('**bold**')).toBeInTheDocument()
    expect(screen.getByText('_italic_')).toBeInTheDocument()
  })
})
