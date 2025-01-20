import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ModelPacks, validatePack, validateMultiplePacks} from '../routes/ModelPacks'
import {getModelPacksRoutePayload} from '../test-utils/mock-data'

test('Renders the ModelPacks', () => {
  const routePayload = getModelPacksRoutePayload()
  render(<ModelPacks />, {
    routePayload,
  })
  expect(screen.getByTestId('model-packs-form')).toHaveAttribute('action', routePayload.formUrl)
})

test('pack validation accepts valid pack name specificiers', () => {
  expect(validatePack('semmle/a')).toBe('')
  expect(validatePack('codeql-b')).toBe('')
  expect(validatePack('c')).toBe('')
  expect(validatePack('codeql-b-test')).toBe('')
  expect(validatePack('codeql/b-test')).toBe('')
  expect(validatePack('codeql-cpp')).toBe('')
  expect(validatePack('codeql/cpp-all')).toBe('')
})

test('pack validation rejects invalid pack name specificiers', () => {
  expect(validatePack('a/b/c')).toBe('pack name')
  expect(validatePack('invalid~char')).toBe('pack name')
  expect(validatePack('')).toBe('pack name')
  expect(validatePack(' ')).toBe('pack name')
  expect(validatePack('A/b')).toBe('pack name')
  expect(validatePack('a/B')).toBe('pack name')
  expect(validatePack('@')).toBe('pack name')
  expect(validatePack(' @1.0.0')).toBe('pack name')
})

test('pack validation accepts valid pack version range specificiers', () => {
  // CodeQL have the following two cases as valid, they are not valid
  // here as the do not match the NPM spec.
  // 3.1.0 - 3.2.0 =3.1.7
  // 1.2.3 || 1.2.7 - 1.3.5 >1.2.9 || 4.5.6
  expect(validatePack('name@1.0.0')).toBe('')
  expect(validatePack('name@1.0.0')).toBe('')
  expect(validatePack('name@3.1.*')).toBe('')
  expect(validatePack('name@3.1.x')).toBe('')
  expect(validatePack('name@3.1.X')).toBe('')
  expect(validatePack('name@3.1')).toBe('')
  expect(validatePack('name@3.*')).toBe('')
  expect(validatePack('name@3')).toBe('')
  expect(validatePack('name@*')).toBe('')
  expect(validatePack('name@=1.0.0')).toBe('')
  expect(validatePack('name@>=1.0.0')).toBe('')
  expect(validatePack('name@>1.0.0')).toBe('')
  expect(validatePack('name@<=1.0.0')).toBe('')
  expect(validatePack('name@<1.0.0')).toBe('')
  expect(validatePack('name@=1.0.0-alpha')).toBe('')
  expect(validatePack('name@5.0.0 - 5.2.7')).toBe('')
  expect(validatePack('name@5.0.* - 5.2')).toBe('')
  expect(validatePack('name@~5.0.1')).toBe('')
  expect(validatePack('name@~*')).toBe('')
  expect(validatePack('name@^0.0.2')).toBe('')
  expect(validatePack('name@>=3.1.0 <3.2.0')).toBe('')
  expect(validatePack('name@1.2.3 || 4.5.6')).toBe('')
  expect(validatePack('name@>=1.0.0-alpha.1 <=1.0.0-alpha.2 || >=1.0.0-alpha.4 <=1.0.0-alpha.5 || <=1.0.0')).toBe('')
})

test('pack validation rejects invalid pack version range specificiers', () => {
  // CodeQL have the following cases as invalid as the do not allow empty ranges or wildcards in the middle.
  // They are valid here, as the follow the NPM spec.
  // ||1.2.3
  // 1.2.3||
  // 1.*.3
  expect(validatePack('pack@')).toBe('range')
  expect(validatePack('pack@ ')).toBe('range')
  expect(validatePack('pack@1.2.3&&4.5.6')).toBe('range')
  expect(validatePack('pack@1.2.3-4.*')).toBe('range')
  expect(validatePack('pack@1.2.3 -4.*')).toBe('range')
  expect(validatePack('pack@1.2.3 - 4.5.6 - 7.8.9')).toBe('range')
  expect(validatePack('pack@1.2.**')).toBe('range')
})

test('multi pack validation accepts multiple packs', () => {
  expect(validateMultiplePacks('pack@1.2.3')).toBe('')
  expect(validateMultiplePacks('pack@1.2.3\npack@4.5.6')).toBe('')
  expect(validateMultiplePacks('pack@1.2.3\n\npack2@4.5.6')).toBe('')
  expect(validateMultiplePacks('pack@1.2.3\r\npack2@4.5.6')).toBe('')
  expect(validateMultiplePacks('pack@1.2.3\r\npack2@4.5.6\npack3@7.8.9')).toBe('')
})
