import {attr, controller} from '@github/catalyst'
import hljs from 'highlight.js'

// This regex will match single lines of code with the leading numbering format [23,23]
// https://github.com/github/copilot-api/pull/3949
const LINE_REGEX = /^(?: *\[(-?\d+),(-?\d+)\])?([ +-])?(.*)$/
const PATH_REGEX = /^(.*?)(?::(\d+(?:[,-]\d+)*))?$/
const MAX_LINES = 30

type LineInfo = {
  leftLineNumber: number | undefined
  rightLineNumber: number | undefined
  lineMarker: string
  code: string
  html?: string
}

@controller
export class CopilotInlineDiffElement extends HTMLElement {
  @attr diff = ''
  @attr filepath = ''

  connectedCallback() {
    const diffLines = this.diff.split('\n')
    const context = diffLines[0]?.trimStart().startsWith('@@') ? diffLines.shift() : ''
    const code = diffLines.map(line => line.replace(LINE_REGEX, '$4')).join('\n')
    const highlightResult = hljs.highlightAuto(code)
    const htmlLines = highlightResult.value.split('\n')
    const lineInfos = diffLines.map((line, i) => this.#parseLine(line, htmlLines[i]))
    const highlightClass = `hljs language-${highlightResult.language ?? 'plaintext'}`
    const [, path, lineNumbers] = this.filepath.match(PATH_REGEX) ?? []

    const table = document.createElement('table')
    table.className = 'diff-table file'

    // Only add a file header if a filepath is provided
    if (path) {
      table.appendChild(this.#createFileHeaderRow(path))
    }

    // Only add header context if provided
    if (context) {
      table.appendChild(this.#createContextRow(context))
    }

    const ranges = this.#createRanges(lineNumbers)
    let rangeIndex = 0
    let totalLines = 0

    for (const [start, end] of ranges) {
      // Avoid potential overlapping ranges and collapsing only a few lines.
      const nextRange = ranges[++rangeIndex]
      const newEnd = nextRange && nextRange[0] - end <= 3 ? nextRange[0] - 1 : end
      const lineInfosInRange = this.#getLinesInRange(start, newEnd, lineInfos)

      totalLines += lineInfosInRange.length

      // Only add up to MAX_LINES lines to the table.
      for (const lineInfo of lineInfosInRange.slice(0, MAX_LINES)) {
        table.appendChild(this.#createDiffLineRow(lineInfo, highlightClass))
      }

      // Add collapsed row if there is another range beyond this one or if the last range was not fully expanded
      if (nextRange ? newEnd < nextRange[0] : lineInfosInRange.length > MAX_LINES) {
        table.appendChild(this.#createCollapsedRow())
      }
    }

    // Only add the table if there are valid lines to display
    if (totalLines > 0) {
      this.replaceChildren(table)
    }
  }

  #parseLine(text: string, html?: string): LineInfo {
    const matches = text.match(LINE_REGEX) ?? []

    return {
      leftLineNumber: matches[1] ? Number(matches[1]) : undefined,
      rightLineNumber: matches[2] ? Number(matches[2]) : undefined,
      lineMarker: matches[3] ?? '',
      code: matches[4] ?? '',
      html,
    }
  }

  #getLinesInRange(start: number, end: number, lineInfos: LineInfo[]) {
    // Prefer using the right (added) line numbers.
    const rightLines = lineInfos.filter(
      ({rightLineNumber}) => rightLineNumber && rightLineNumber >= start && rightLineNumber <= end,
    )
    if (rightLines.length) return rightLines

    // If no right line numbers are found, fallback to using the left line numbers.
    return lineInfos.filter(({leftLineNumber}) => leftLineNumber && leftLineNumber >= start && leftLineNumber <= end)
  }

  #createRanges(lineNumbers: string | undefined) {
    if (!lineNumbers) {
      // This range should cover the entire diff hunk.
      return [[1, Number.MAX_SAFE_INTEGER]] as const
    }

    return lineNumbers
      .split(',')
      .filter(Boolean)
      .map(range => {
        const lines = range.split('-').map(Number)
        const start = Math.max(1, lines[0] ?? 1)
        const end = Math.max(start, lines[1] ?? lines[0] ?? 1)
        return [start, end] as const
      })
      .sort((a, b) => a[0] - b[0])
  }

  #createFileHeaderRow(path: string) {
    const row = document.createElement('tr')
    const cell = document.createElement('th')

    cell.className = 'file-header'
    cell.setAttribute('colspan', '3')
    cell.textContent = path
    row.appendChild(cell)

    return row
  }

  #createContextRow(context: string) {
    const row = document.createElement('tr')
    let cell = document.createElement('td')

    cell.className = 'blob-num blob-code-hunk'
    cell.setAttribute('colspan', '2')
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.className = 'blob-code blob-code-inner blob-code-hunk'
    cell.textContent = context
    row.appendChild(cell)

    return row
  }

  #createCollapsedRow() {
    const row = document.createElement('tr')
    let cell = document.createElement('td')

    cell.className = 'blob-num blob-code-hunk non-expandable'
    cell.setAttribute('colspan', '2')
    cell.setAttribute('data-line-number', '...')
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.className = 'blob-code blob-code-inner blob-code-hunk'
    row.appendChild(cell)

    return row
  }

  #createDiffLineRow(lineInfo: LineInfo, highlightClass: string) {
    const {leftLineNumber, rightLineNumber, lineMarker, html} = lineInfo
    const changeSuffix = lineMarker === '+' ? 'addition' : lineMarker === '-' ? 'deletion' : 'context'
    const numClass = `blob-num blob-num-${changeSuffix}`
    const codeClass = `blob-code blob-code-${changeSuffix} blob-code-inner blob-code-marker ${highlightClass}`

    const row = document.createElement('tr')
    let cell = document.createElement('td')

    cell.className = numClass
    cell.setAttribute('data-line-number', lineMarker === '+' ? '' : String(leftLineNumber))
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.className = numClass
    cell.setAttribute('data-line-number', lineMarker === '-' ? '' : String(rightLineNumber))
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.className = codeClass
    cell.innerHTML = html ?? ''
    cell.setAttribute('data-code-marker', lineMarker)
    row.appendChild(cell)

    return row
  }
}
