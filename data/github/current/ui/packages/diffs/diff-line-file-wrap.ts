// The set pixel value of a char in a diffline.
const CHAR_PIXEL_SIZE = 7

// Tab char used in a line's text to determine if tabs are used in the diffline code.
const TAB_CHAR = '\t'

/**
 * This is a closure that will calculate and memoize the required text indentation and padding left pixel values for a wrapped Diffline.
 * It will handle difflines that have indentation through spaces or tabs and handle their associated space value
 * These values are meant to be used with a components inline styling.
 *
 * @param {DiffLine} text - The text to calculate the required text indentation and padding left values for.
 * @param {number} tabSize - The expected tab size of the DiffLine
 * @returns {getPaddingLeft, getTextIndent}: two functions that return the required text indentation and padding left values for a wrapped Diffline.
 * Both of these functions will return a memoized pixel value, so the cost of calucating the value is only done once.
 */
export function diffLineFileWrap(text: string, tabSize: number) {
  let tabCount: number | undefined
  let paddingLeft: string | undefined
  let textIndent: string | undefined

  // This removes the first character of a line's text as it will be contain line type info defined as:
  // 1. + char
  // 2. - char
  // 3. empty char
  // It then searches the remaing text for the position of the first character in the string that is not an empty char.
  const indentationLength: number = text.slice(1).search(/\S/) || 0

  if (text.includes(TAB_CHAR)) {
    // This splits the text into an array that is 1 item larger than the number of \t elements in the string.
    // e.g. '+\t\tfunction gameOver() {' -> ['+', '', 'function gameOver() {']
    // it subtracts 1 from the length to get the correct tab count.
    tabCount = text.split(new RegExp(TAB_CHAR)).length - 1
  }

  // This function will return a positive pixel value.
  // The value will be used to offset the indentation for a wrapped line when the DiffLine has text indentation through spaces or tabs.
  function getPaddingLeft() {
    // use the memoized closure variable paddingLeft if it is defined
    if (paddingLeft) return paddingLeft

    if (tabCount) {
      // padding left, with "Tabs", is calculated by:
      // tab size x tab count x 7 (CHAR_PIXEL_SIZE)
      paddingLeft = `${tabSize * tabCount * CHAR_PIXEL_SIZE}px`
      return paddingLeft
    }

    if (indentationLength < 1) {
      // return '0px' as this line does not have indentation
      paddingLeft = '0px'
      return paddingLeft
    }

    // padding left, with "Spaces", is calculated by:
    // indentation length x 7 (CHAR_PIXEL_SIZE)
    paddingLeft = `${indentationLength * CHAR_PIXEL_SIZE}px`
    return paddingLeft
  }

  // This function will return a negative pixel value.
  // The value will be used to offset the left padding for a wrapped line when the DiffLine has text indentation through spaces or tabs
  function getTextIndent() {
    // Use the memoized closure variable textIndent if it is defined
    if (textIndent) return textIndent

    if (tabCount) {
      // Indentation, with "Tabs", is calculated by:
      // tab size x tab count x 7 (CHAR_PIXEL_SIZE) + tab size
      textIndent = `-${tabSize * tabCount * CHAR_PIXEL_SIZE + tabSize}px`
      return textIndent
    }

    if (indentationLength < 1) {
      // Return '0px' as this line does not have indentation
      textIndent = '0px'
      return textIndent
    }

    // Indentation, with "Spaces", is calculated by:
    // indentation length x 7 (CHAR_PIXEL_SIZE) + 0.5 (needed to simply state to the CSS that the indented line is slightly larger in value than the left padding)
    textIndent = `-${indentationLength * CHAR_PIXEL_SIZE + 0.5}px`
    return textIndent
  }

  return {
    getPaddingLeft,
    getTextIndent,
  }
}
