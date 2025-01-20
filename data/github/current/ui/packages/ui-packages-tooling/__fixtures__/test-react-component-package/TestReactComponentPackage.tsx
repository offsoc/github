export interface TestReactComponentPackageProps {
  exampleMessage: string
}

export function TestReactComponentPackage({exampleMessage}: TestReactComponentPackageProps) {
  return <article>This is an example: {exampleMessage}</article>
}
