import {SelectedRows} from './SelectedRows'
import {PickerHeader} from './PickerHeader'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Spacing} from '../../utils'

interface Props {
  title: string
  // Number of rows to render
  totalCount: number
  // Optionally display the resource selector in view-only mode
  viewOnly?: boolean
}

export function PickerLoadingSkeleton({title, totalCount, viewOnly = false}: Props) {
  return (
    <>
      <PickerHeader title={title} />
      <div>
        {!viewOnly && <LoadingSkeleton sx={{width: '50%', height: '32px', mb: Spacing.StandardPadding}} />}
        <SelectedRows loading={true} removeOption={() => {}} selected={[]} totalCount={totalCount} />
      </div>
    </>
  )
}
