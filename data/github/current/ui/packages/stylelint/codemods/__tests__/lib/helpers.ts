import stylelint from 'stylelint'
import type {Config} from 'stylelint'

export type RejectTest = {
  code: string
  fixed?: string
  unfixable?: boolean
  description: string
  warnings?: Array<{
    message: string
    line: number
    column: number
    endColumn: number
  }>
}

export type AcceptTest = {
  code: string
  description: string
}

export function testRule({config, accept, reject}: {config: Config; accept: AcceptTest[]; reject: RejectTest[]}) {
  describe('Accepts', () => {
    for (const {code, description} of accept) {
      it(`${description}`, async () => {
        const {
          results: [result],
        } = await stylelint.lint({
          code,
          config,
        })

        expect(result).toBeDefined()
        if (!result) return

        expect(result.parseErrors).toHaveLength(0)
        expect(result.warnings).toHaveLength(0)
      })
    }
  })

  describe('Rejects', () => {
    for (const {code, unfixable, fixed, description, warnings} of reject) {
      it(`${description}`, async () => {
        const lintedCode = await stylelint.lint({
          code,
          config,
        })

        const {
          results: [result],
        } = lintedCode

        expect(result).toBeDefined()
        if (!result) return

        expect(result.parseErrors).toHaveLength(0)
        expect(result.warnings).toHaveLength(warnings?.length || 0)
        expect(lintedCode.code).toBe(unfixable ? code : fixed)

        let index = 0
        for (const warning of result.warnings) {
          if (!warnings) return

          expect(warning.text).toBe(warnings[index]?.message)
          expect(warning.line).toBe(warnings[index]?.line)
          expect(warning.column).toBe(warnings[index]?.column)
          expect(warning.endColumn).toBe(warnings[index]?.endColumn)
          index++
        }
      })
    }
  })
}
