export interface TestReactPartialPackageProps {
  exampleMessage: string
}

export function TestReactPartialPackage({exampleMessage}: TestReactPartialPackageProps) {
  return <article>This is an example: {exampleMessage}</article>
}
