export interface TestSsrReactPartialPackageProps {
  exampleMessage: string
}

export function TestSsrReactPartialPackage({exampleMessage}: TestSsrReactPartialPackageProps) {
  return <article>This is an example: {exampleMessage}</article>
}
