export interface IssueMetadataProps {
  exampleMessage: string
}

export function IssueMetadata({exampleMessage}: IssueMetadataProps) {
  return <article>This is an example: {exampleMessage}</article>
}
