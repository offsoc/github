import type {Subject as CommentEditorSubject} from '../subject'

export type SubjectType = 'issue' | 'pull_request' | 'project'

/**
 * Describes the location on GitHub of the Markdown being edited.
 */
export interface ApiMarkdownSubject {
  subjectType: SubjectType
  subjectRepoId?: number
  subjectId?: number
}
export const ApiMarkdownSubject = {
  fromPropsSubject: (subject: CommentEditorSubject | undefined): Partial<ApiMarkdownSubject> => {
    if (!subject) {
      return {}
    }

    if (subject.type === 'project') {
      return {
        subjectId: subject.id?.databaseId,
        subjectType: subject.type,
      }
    }

    return {
      subjectId: subject.id?.databaseId,
      subjectRepoId: subject.repository.databaseId,
      subjectType: subject.type === 'issue_comment' ? 'issue' : subject.type,
    }
  },
}
