import {BaseBatchDeferredContentElement} from '../../assets/modules/github/behaviors/batch-deferred-content'
import type {BatchLoader} from '../../assets/modules/github/behaviors/batch-deferred-content/batch-loader'
import {controller, targets} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'

const DiffLineTypes = ['hunk', 'addition', 'deletion', 'context', 'injected_context'] as const

interface DiffLine {
  type: (typeof DiffLineTypes)[number]
  left: number | null
  right: number | null
  html: string
}

abstract class DiffRow {
  tableRow: HTMLTableRowElement

  constructor(tableRow: HTMLTableRowElement) {
    this.tableRow = tableRow
  }

  get lineNumbers(): [number | null, number | null] {
    const numberCells = this.tableRow.querySelectorAll<HTMLTableCellElement>('td.blob-num')
    const numbers = Array.from(numberCells).map(cell => parseInt(cell.getAttribute('data-line-number') || '') || null)

    return [numbers[0] || null, numbers[1] || null]
  }

  replaceChildren(element: HTMLElement, html: string) {
    const newContents = parseHTML(document, html)
    if (newContents.textContent?.trim() !== element.textContent?.trim()) {
      return
    }
    element.replaceChildren(newContents)
  }

  abstract applyAddition(line: DiffLine): void
  abstract applyDeletion(line: DiffLine): void
  abstract applyContext(line: DiffLine): void
}

class UnifiedDiffRow extends DiffRow {
  get innerCode(): HTMLElement {
    return this.tableRow.querySelector('.blob-code-inner')!
  }

  applyAddition(line: DiffLine): void {
    this.replaceChildren(this.innerCode, line.html)
  }

  applyDeletion(line: DiffLine): void {
    this.replaceChildren(this.innerCode, line.html)
  }

  applyContext(line: DiffLine): void {
    this.replaceChildren(this.innerCode, line.html)
  }
}

class SplitDiffRow extends DiffRow {
  get rightInnerCode(): HTMLElement {
    return this.tableRow.querySelector('[data-split-side="right"] .blob-code-inner')!
  }

  get leftInnerCode(): HTMLElement {
    return this.tableRow.querySelector('[data-split-side="left"] .blob-code-inner')!
  }

  applyAddition(line: DiffLine): void {
    this.replaceChildren(this.rightInnerCode, line.html)
  }

  applyDeletion(line: DiffLine): void {
    this.replaceChildren(this.leftInnerCode, line.html)
  }

  applyContext(line: DiffLine): void {
    this.replaceChildren(this.leftInnerCode, line.html)
    this.replaceChildren(this.rightInnerCode, line.html)
  }
}

export const deferredDiffLinesLoaders: Map<string, BatchLoader<DiffLine[]>> = new Map()

@controller
export class DeferredDiffLinesElement extends BaseBatchDeferredContentElement<DiffLine[]> {
  @targets override inputs: HTMLInputElement[]

  override batchLoaders = deferredDiffLinesLoaders

  animationFrameHandle: ReturnType<typeof requestAnimationFrame> | null

  disconnectedCallback() {
    if (this.animationFrameHandle) {
      cancelAnimationFrame(this.animationFrameHandle)
    }
  }

  validate(value: unknown): asserts value is DiffLine[] {
    if (!Array.isArray(value)) {
      throw new Error('Batch deferred diff lines were not an array')
    }
    for (const item of value) {
      if (
        DiffLineTypes.includes(item?.type) &&
        typeof item?.html === 'string' &&
        (typeof item?.left === 'number' || item?.left === null) &&
        (typeof item?.right === 'number' || item?.right === null)
      ) {
        continue
      }

      throw new Error('Malformed Batch deferred diff line')
    }
  }

  update(content: DiffLine[]): void {
    const diffRows = this.querySelectorAll<HTMLTableRowElement>(
      'table.js-diff-table > tbody > tr:not(.js-inline-comments-container)',
    )
    const table = diffRows[0]?.closest('table')

    if (!table) {
      throw new Error(`No .js-diff-table found within ${this.tagName}`)
    }

    const splitDiff = table.classList.contains('js-file-diff-split')
    const diffRowsByLeftLineNumber = new Map<number, DiffRow>()
    const diffRowsByRightLineNumber = new Map<number, DiffRow>()

    for (const row of diffRows) {
      const wrappedRow: DiffRow = splitDiff ? new SplitDiffRow(row) : new UnifiedDiffRow(row)
      const [left, right] = wrappedRow.lineNumbers

      if (left) {
        diffRowsByLeftLineNumber.set(left, wrappedRow)
      }
      if (right) {
        diffRowsByRightLineNumber.set(right, wrappedRow)
      }
    }

    this.animationFrameHandle = requestAnimationFrame(() => {
      for (const line of content) {
        const leftRow = line.left ? diffRowsByLeftLineNumber.get(line.left) : null
        const rightRow = line.right ? diffRowsByRightLineNumber.get(line.right) : null

        switch (line.type) {
          case 'addition':
            rightRow?.applyAddition(line)
            break
          case 'deletion':
            leftRow?.applyDeletion(line)
            break
          case 'context':
          case 'injected_context':
            leftRow?.applyContext(line)
            break
        }
      }

      this.animationFrameHandle = requestAnimationFrame(() => {
        this.classList.remove('awaiting-highlight')
        this.animationFrameHandle = null
        this.dispatchEvent(new CustomEvent('deferred-highlight:applied', {bubbles: true}))
      })
    })
  }

  isAwaitingHighlight(): boolean {
    return this.classList.contains('awaiting-highlight')
  }
}
