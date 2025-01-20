import {Button} from '@primer/react'

export interface GitHubEditorTabProps {
  editorPath: string
}

export function GitHubEditorTab(props: GitHubEditorTabProps) {
  return (
    <div className="p-3 d-flex flex-column">
      <div className="pb-3">
        <span>Edit files and run code in this Pull Request directly from the browser.</span>
      </div>
      <Button
        variant="primary"
        className="width-full"
        onClick={() => {
          window.open(props.editorPath)
        }}
      >
        Open Editor
      </Button>
    </div>
  )
}
