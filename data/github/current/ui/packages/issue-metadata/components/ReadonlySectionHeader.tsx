import type {SxProp} from '@primer/react'
import {SectionHeader, type StyledHeadingProps} from './SectionHeader'

export type ReadonlySectionHeaderProps = {
  title: string
  'data-testid'?: string
  headingProps?: StyledHeadingProps
} & SxProp

export function ReadonlySectionHeader({
  title,
  headingProps: {...headingProps} = {},
  ...props
}: ReadonlySectionHeaderProps) {
  return <SectionHeader title={title} headingProps={headingProps} {...props} readonly={true} />
}
