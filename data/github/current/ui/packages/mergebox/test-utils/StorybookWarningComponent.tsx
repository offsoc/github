import {Flash} from '@primer/react'

export default function StoryBookWarning(warnings: string[]) {
  if (warnings.length > 0) {
    return (
      <Flash>
        {warnings.map((s: string, i: number) => (
          <p key={i}>{s}</p>
        ))}
      </Flash>
    )
  } else {
    return null
  }
}
