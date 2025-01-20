import type {DiffAnnotation} from '@github-ui/conversations'
import {SearchIcon} from '@primer/octicons-react'
import {Box, type SxProp, TextInput} from '@primer/react'

/**
 * Return a set of annotation ids that match the current filter state
 */
export function useFilteredAnnotations(annotations: DiffAnnotation[], filteredText: string): Set<string> {
  const matchingAnnotationIds = annotations
    .filter(annotation => filterAnnotation(annotation, filteredText))
    .map(annotation => annotation.id)
  return new Set(matchingAnnotationIds)
}

function filterAnnotation(annotation: DiffAnnotation, filteredText: string) {
  if (filteredText) {
    const filteredTextLowerCase = filteredText.toLowerCase()
    if (
      !annotation.annotationLevel.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.message.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.path.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.title?.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.checkRun.name?.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.checkSuite.app?.name.toLowerCase().includes(filteredTextLowerCase) &&
      !annotation.checkSuite.name?.toLowerCase().includes(filteredTextLowerCase)
    ) {
      return false
    }
  }

  return true
}

type AnnotationsFilterProps = {
  filteredText: string
  onFilteredTextChange: (filterText: string) => void
} & SxProp

export function AnnotationsFilter({filteredText, onFilteredTextChange, sx}: AnnotationsFilterProps) {
  return (
    <Box sx={sx}>
      <TextInput
        block
        aria-label="Filter annotations…"
        leadingVisual={SearchIcon}
        placeholder="Filter annotations…"
        value={filteredText}
        onChange={event => onFilteredTextChange(event.target.value)}
      />
    </Box>
  )
}
