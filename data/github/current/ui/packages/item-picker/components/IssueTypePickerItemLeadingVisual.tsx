import {Box} from '@primer/react'
import {colorNames, useNamedColor} from '@github-ui/use-named-color'
import type {IssueTypeColor} from './__generated__/IssueTypePickerIssueType.graphql'

export const createIssueTypePickerItemLeadingVisual = (color: IssueTypeColor) =>
  function IssueTypePickerItemLeadingVisual() {
    const effectiveColor = colorNames.find(c => c === color)
    const {bg, accent} = useNamedColor(effectiveColor)
    return (
      <Box
        sx={{
          bg,
          borderColor: accent,
          borderWidth: 2,
          borderStyle: 'solid',
          width: 12,
          height: 12,
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
    )
  }
