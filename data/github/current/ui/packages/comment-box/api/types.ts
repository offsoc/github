import type {Subject as CommentBoxSubject} from '../subject'

export type SubjectType = 'issue' | 'pull_request' | 'project' | 'commit'

export type SavedRepliesContext = 'issue' | 'pull_request'

/**
 * Describes the location on GitHub of the Markdown being edited.
 */
export interface ApiMarkdownSubject {
  subjectType: SubjectType
  subjectRepoId?: number
  subjectId?: string
}
export const ApiMarkdownSubject = {
  fromPropsSubject: (subject: CommentBoxSubject | undefined): Partial<ApiMarkdownSubject> => {
    if (!subject) {
      return {}
    }

    if (subject.type === 'project') {
      return {
        subjectId: subject.id?.databaseId?.toString(),
        subjectType: subject.type,
      }
    }

    return {
      subjectId: subject.id?.databaseId?.toString() ?? subject.id?.id,
      subjectRepoId: subject.repository.databaseId,
      subjectType: subject.type === 'issue_comment' ? 'issue' : subject.type,
    }
  },
}
