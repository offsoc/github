import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {type SxProp, FormControl, Box} from '@primer/react'
import {type ReactNode, useId} from 'react'

type ElementWrapperProps = {
  /** Text used as label */
  label: string
  /** Forces user input and displays a visual required element */
  required?: boolean | null
  /** Text used as the field description */
  description?: string | null
  /** Validation message to display */
  validationResult?: string | undefined
  /** Child function that passes the label and description ids for accessibility */
  children: (renderProps: ElementWrapperRenderProps) => ReactNode
}

type ElementWrapperRenderProps = {
  /** Id of the label element to attach via the `aria-labelledby` attribute */
  labelId: string
  /** Ids of the description and validation elements to attach via the `aria-describedby` attribute */
  descriptionIds: string
}

export function ElementWrapper({
  children,
  label,
  required,
  description,
  validationResult,
  sx,
}: ElementWrapperProps & SxProp) {
  const labelId = useId()
  const descriptionId = useId()
  const validationId = useId()
  // We can remove the outter box and shift the `children` rendering back inside the `FormControl` once
  // https://github.com/github/collaboration-workflows-flex/issues/178 is fixed.
  // This is a temporary work around to unblock the `MarkdownEditor` toolbar from not working.
  return (
    <Box
      sx={{
        my: 2,
        ...sx,
      }}
    >
      <FormControl required={required ?? false}>
        <FormControl.Label
          id={labelId}
          sx={{
            color: 'var(--fgColor-default, var(--color-fg-default))',
            fontSize: '14px',
            // Color the required asterisk
            '> span > span:last-of-type': {color: 'var(--fgColor-danger, var(--color-danger-fg))'},
            mb: description ? 0 : 2,
          }}
        >
          {label}
        </FormControl.Label>
        {description && (
          <FormControl.Caption
            id={descriptionId}
            sx={{
              color: 'var(--fgColor-muted, var(--color-fg-subtle))',
              mt: 0,
            }}
          >
            <SafeHTMLBox html={description as SafeHTMLString} className="markdown-body note text-small mb-2" />
          </FormControl.Caption>
        )}
      </FormControl>
      {children({
        labelId,
        descriptionIds: `${descriptionId} ${validationId}`,
      })}
      {validationResult && (
        <FormControl.Validation id={validationId} variant="error" sx={{mt: 2}}>
          {validationResult}
        </FormControl.Validation>
      )}
    </Box>
  )
}
