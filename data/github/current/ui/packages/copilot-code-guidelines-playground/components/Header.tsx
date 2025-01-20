import {Button, IconButton} from '@primer/react'
import {ArrowLeftIcon, PlayIcon} from '@primer/octicons-react'

export interface HeaderProps {
  indexPath: string
}

export default function Header({indexPath}: HeaderProps) {
  // TODO: When multiple samples are supported, make this dynamic
  const numberOfSamples = 0

  return (
    <div className="d-flex flex-items-center flex-justify-between gap-3">
      <div className="d-flex flex-items-center gap-1">
        <IconButton
          icon={ArrowLeftIcon}
          aria-label="Back to code guidelines"
          size="small"
          variant="invisible"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back()
            } else {
              window.location.href = indexPath
            }
          }}
        />
        <h2 className="text-semibold">Guideline playground</h2>
      </div>

      <div className="d-flex gap-2">
        <Button
          leadingVisual={PlayIcon}
          count={numberOfSamples > 1 ? numberOfSamples : undefined}
          // TODO: Replace `true` with a condition that checks if the guideline is currently running
          disabled={true}
        >
          Run{numberOfSamples > 1 && ' all'}
        </Button>
        <Button variant="primary">Save guideline</Button>
      </div>
    </div>
  )
}
