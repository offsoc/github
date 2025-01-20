// Interface that makes "integration" testing at the manager level easier than
// it would be.
export interface TextRuler {
  getNumberOfLines(text: string, withScrollbar: boolean): number
}

// Interface to support unit testing the ruler.  Browser tested setup doesn't
// behave appropriately for scrollbar appearance, so fake it till we make it.
export interface TextRulerTarget {
  scrollHeight: number
  style: {
    height?: string
    lineHeight: string
    overflowY?: string
  }
  value?: string
}

// Specific ruler implementation that leans on a specially crafted textarea and
// its scrollHeight to do measurement.
export class TextAreaRuler {
  private rulerTextArea: TextRulerTarget
  private lineHeight: number

  constructor(rulerTextArea: TextRulerTarget) {
    const heightStr = rulerTextArea.style.lineHeight.replace('px', '')
    this.lineHeight = Number.parseInt(heightStr)
    this.rulerTextArea = rulerTextArea
  }

  getNumberOfLines(text: string, withScrollbar: boolean): number {
    // We need to set the ruler to whatever the scrolling state is that we
    // detected on the targets we're measuring for.
    //
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y
    this.rulerTextArea.style.overflowY = withScrollbar ? 'scroll' : 'hidden'

    // We have to zero out height in case it got reset to get the scrollHeight
    // set properly if it got smaller.
    this.rulerTextArea.style.height = '0px'
    this.rulerTextArea.value = text

    const lines = Math.round(this.rulerTextArea.scrollHeight / this.lineHeight)

    // If debugging, it's useful to see the contents of the ruler.
    // Uncomment this to accomplish that. Can't do in normal operation or it takes up space
    // because it has to be position: relative...
    // this.rulerTextArea.style.height = `${this.rulerTextArea.scrollHeight}px`

    return lines
  }
}
