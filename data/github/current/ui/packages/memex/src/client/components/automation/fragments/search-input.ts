/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {graphql} from 'relay-runtime'

import type {searchInputLabel$data} from '../__generated__/searchInputLabel.graphql'
import type {searchInputMilestone$data} from '../__generated__/searchInputMilestone.graphql'
import type {searchInputIssueType$data} from './__generated__/searchInputIssueType.graphql'

export type Milestone = searchInputMilestone$data
export const milestoneFragment = graphql`
  fragment searchInputMilestone on Milestone @inline {
    id
    title
    closed
  }
`

export type Label = searchInputLabel$data
export const labelFragment = graphql`
  fragment searchInputLabel on Label @inline {
    id
    color
    name
    nameHTML
    description
  }
`

export type IssueType = searchInputIssueType$data
export const issueTypeFragment = graphql`
  fragment searchInputIssueType on IssueType @inline {
    id
    name
    isEnabled
  }
`
