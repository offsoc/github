import {lazy} from 'react'

import Results from './Results'
import {IconButton, Spinner} from '@primer/react'
import {CopilotIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'

const CodeMirror = lazy(() => import('@github-ui/code-mirror'))

export default function Sample() {
  // TODO: Make this dynamic
  const isGenerating = false

  return (
    <div className="d-flex flex-column border rounded-2 overflow-hidden flex-1">
      <div className="d-flex flex-items-center flex-justify-between gap-2 bgColor-muted border-bottom py-2 pl-3 pr-2">
        <h3 className="f4 d-flex gap-2">
          Sample
          {/* TODO: When we allow multiple samples, remove the condition below and replace the `1` with the sample number */}
          {false && <span className="text-normal fgColor-muted">#1</span>}
        </h3>
        <div>
          <IconButton icon={PencilIcon} aria-label="Edit sample" size="small" variant="invisible" />
          <IconButton icon={TrashIcon} aria-label="Delete sample" size="small" variant="invisible" />
        </div>
      </div>
      <div className="d-flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <CodeMirror
            fileName={''}
            value={`hello\nworld\nhello\nworld\nhello\nworld\nhello\nworld\nhello\nworld\nhello\nworld\nhello\nworld\nhello\nworld\nhello\nworld`}
            ariaLabelledBy={'Sample'}
            spacing={{
              indentUnit: 2,
              indentWithTabs: false,
              lineWrapping: true,
            }}
            isReadOnly={true}
            onChange={() => {}}
          />
        </div>
        <div className="flex-1 border-left p-3 overflow-y-auto">
          {isGenerating ? (
            <div className="height-full d-flex flex-column flex-justify-center flex-items-center gap-2 fgColor-muted">
              <div className="d-flex position-relative fgColor-accent">
                <Spinner size="medium" srText={null} />
                <span className="d-flex position-absolute inset-0 p-2">
                  <CopilotIcon size={16} />
                </span>
              </div>
              Generating response…
            </div>
          ) : (
            <Results />
          )}
        </div>
      </div>
    </div>
  )
}
