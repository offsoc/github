import {Box, Text} from '@primer/react'
import {ORGANIZATION_ISSUE_TYPES_LIMIT} from '../constants/constants'

type IssueTypesListHeaderProps = {
  numberOfIssueTypes: number
}

export const IssueTypesListHeader = ({numberOfIssueTypes}: IssueTypesListHeaderProps) => (
  <Box sx={{display: 'flex', flexDirection: 'row'}}>
    <span>{`${numberOfIssueTypes} types`}</span>
    <Text sx={{color: 'fg.muted', pl: 1}}>{`(max ${ORGANIZATION_ISSUE_TYPES_LIMIT})`}</Text>
  </Box>
)
