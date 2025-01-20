export interface TestIdProps {
  /** Test ID to be queried by automated testing suites */
  'data-testid'?: string
}

export const testIdProps = (value: string): TestIdProps => {
  return {'data-testid': value}
}
