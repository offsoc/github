import {graphql} from 'react-relay'

const updateWhitespacePreferenceMutation = graphql`
  mutation updateWhitespacePreferenceMutation(
    $pullRequestId: ID!
    $whitespacePreference: Boolean!
    $singleCommitOid: String = null
    $endOid: String = null
    $injectedContextLines: [DiffLineRange!] = null
    $inlineThreadCount: Int = 20
    $isSingleCommit: Boolean = false
    $diffEntryCount: Int = 5
    $diffEntryCursor: String = null
    $startOid: String = null
  ) @raw_response_type {
    updateWhitespacePreference(input: {pullRequestId: $pullRequestId, ignoreWhitespace: $whitespacePreference}) {
      pullRequest {
        id
        ...PullRequestFilesViewerContent_pullRequest
      }
    }
  }
`

export default updateWhitespacePreferenceMutation
