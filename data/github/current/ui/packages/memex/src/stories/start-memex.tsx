import {Profiler} from 'react'
import type {Root} from 'react-dom/client'

import Memex from '../client/memex'
import {renderMemex} from '../client/render-memex'
import type {StoryDefinition} from './story-definitions'

export function startMemexStory({
  storyDefinition,
  root,
  element,
}: {
  storyDefinition: StoryDefinition
  element: HTMLElement
  root: Root
}) {
  let memexApplication = (
    <Memex rootElement={element}>{storyDefinition.forceRenderError ? <ForcedRenderError /> : null}</Memex>
  )

  if (storyDefinition.profilerId) {
    const recordMeasurement: React.ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
      window.memexPerformance.addProfilerMeasurement({
        id,
        phase,
        actualDuration,
        baseDuration,
      })
    }
    memexApplication = (
      <Profiler id={storyDefinition.profilerId} onRender={recordMeasurement}>
        {memexApplication}
      </Profiler>
    )
  }

  renderMemex(memexApplication, element, root)
}

/**
 * This never returns, so we can use it to force a rendering error,
 * which will expose the error boundary handling
 */
function ForcedRenderError(): JSX.Element {
  throw new Error(
    `This error was forced by the \`StoryDefintion\`.
    Click close at the bottom of the screen to close the overlay,
    and return to your regularly scheduled dev/testing program.
  `,
  )
}
