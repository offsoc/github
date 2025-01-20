declare module 'sourcemap-validator' {
  declare function validate(min: string, map?: string, srcs?: Map<string, string>): void

  export = validate
}
