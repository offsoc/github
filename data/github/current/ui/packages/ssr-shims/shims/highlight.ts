const hljsShim = {
  highlightAuto: (code: string) => ({
    value: code,
    code,
  }),
}

export default hljsShim
