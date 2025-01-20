import {ShieldIcon, ShieldXIcon} from '@primer/octicons-react'
import {SegmentedControl} from '@primer/react'
import {useCallback} from 'react'

type OpenClosedSegmentedControlProps = {openSelected: boolean; onChangeHandler: (openSelected: boolean) => void}
export function OpenClosedSegmentedControl({
  openSelected,
  onChangeHandler,
}: OpenClosedSegmentedControlProps): JSX.Element {
  const wrappedOnChangeHandler = useCallback(
    (index: number) => {
      onChangeHandler(index === 0)
    },
    [onChangeHandler],
  )

  return (
    <SegmentedControl onChange={wrappedOnChangeHandler} aria-label="Alert State Selector" sx={{alignSelf: 'start'}}>
      <SegmentedControl.Button selected={openSelected} leadingIcon={ShieldIcon}>
        Open alerts
      </SegmentedControl.Button>
      <SegmentedControl.Button selected={!openSelected} leadingIcon={ShieldXIcon}>
        Closed alerts
      </SegmentedControl.Button>
    </SegmentedControl>
  )
}
