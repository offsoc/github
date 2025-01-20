// DOMPurify requires a browser-like environment to properly sanitize HTML
// See https://github.com/github/alloy/issues/126 for more details

export default {
  sanitize: () => {
    // Rather than doing something unsafe with the HTML, we throw an error to make it clear that this is not supported in Alloy
    throw new Error('DOMPurify requires a browser environment, which is not yet supported in our SSR environment.')
  },
}
