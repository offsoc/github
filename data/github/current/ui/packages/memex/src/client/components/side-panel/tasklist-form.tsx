import {testIdProps} from '@github-ui/test-id-props'

/**
 * This form is used to embed data that is needed for the Tasklist Web Component.
 */
export const TasklistForm: React.FC<{
  editedBody: string
  issueId?: number
  repositoryId?: number
  projectNumber: number
}> = ({editedBody, issueId, repositoryId, projectNumber}) => {
  return (
    <form id="tasklist-form" {...testIdProps('tasklist-form')}>
      <input type="hidden" name="body" value={editedBody} />
      <input type="hidden" name="item-id" value={issueId} />
      <input type="hidden" name="repository-id" value={repositoryId} />
      <input type="hidden" name="kind" value="issue" />
      <input type="hidden" name="project-id" value={projectNumber} />
    </form>
  )
}
