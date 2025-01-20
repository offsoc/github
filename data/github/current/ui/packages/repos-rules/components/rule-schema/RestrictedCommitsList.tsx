import {useState} from 'react'
import {Box, Text, TextInput, Select, IconButton, BranchName} from '@primer/react'
import {PlusIcon, TrashIcon} from '@primer/octicons-react'
import type {RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {Blankslate} from '../Blankslate'
import {BorderBox} from '../BorderBox'

const DEFAULT_VALUE: RestrictedCommit[] = []
type RestrictedCommit = {oid: string; reason?: string}
const basicReasons = ['Contains secret(s)', 'Contains sensitive information', 'Company IP']
const reasons = [...basicReasons, 'Other']

export function RestrictedCommitsList({value, onValueChange, readOnly}: RegisteredRuleSchemaComponent) {
  const [oid, setOid] = useState('')
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const restrictedCommits = (value as RestrictedCommit[]) || DEFAULT_VALUE

  const addRestrictedCommitToList = (commit: RestrictedCommit) => {
    if (restrictedCommits.find(existing => existing.oid === commit.oid)) return restrictedCommits
    if (commit.oid === '') return restrictedCommits
    onValueChange?.([...restrictedCommits, commit])
  }

  const removeRestrictedCommitFromList = (restrictedCommitToRemove: RestrictedCommit) => {
    onValueChange?.(restrictedCommits.filter(existing => existing.oid !== restrictedCommitToRemove.oid))
  }

  return (
    <BorderBox>
      {readOnly ? null : (
        <Box className="Box-header" sx={{display: 'grid', gridTemplateColumns: '2fr 1fr', alignItems: 'end'}}>
          <Box sx={{p: 1}}>
            <Text as="h5" sx={{mb: 1}}>
              Add full or abbreviated commit hash
            </Text>
            <TextInput placeholder="Commit ID" block sx={{mt: 1}} value={oid} onChange={e => setOid(e.target.value)} />
          </Box>
          <Box sx={{p: 1}}>
            <Text as="h5" sx={{mb: 1}}>
              Reason
            </Text>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '4fr 1fr',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <div>
                <Select placeholder="Select reason" value={reason} onChange={e => setReason(e.target.value)}>
                  {reasons.map(restrictReason => (
                    <Select.Option key={restrictReason} value={restrictReason}>
                      {restrictReason}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <IconButton
                  type="button"
                  aria-label="Add"
                  size="medium"
                  icon={PlusIcon}
                  onClick={() => {
                    setOid('')
                    setOtherReason('')
                    setReason('')
                    addRestrictedCommitToList({oid, reason: reason === 'Other' ? otherReason : reason})
                  }}
                />
              </div>
            </Box>
          </Box>
          {reason === 'Other' ? (
            <Box sx={{gridColumn: '1 / span-2', p: 1}}>
              <TextInput
                className="width-full"
                placeholder="Other reason"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
              />
            </Box>
          ) : null}
        </Box>
      )}

      {restrictedCommits.length === 0 ? (
        <Blankslate heading="No commit IDs have been added yet">
          {readOnly
            ? undefined
            : 'Add a commit ID restriction to prevent specific commits from ever being accepted into target branches'}
        </Blankslate>
      ) : (
        <ul>
          {restrictedCommits.map(restrictedCommit => (
            <li className="Box-row" key={restrictedCommit.oid}>
              <Box className="flex-direction-row flex-justify-between" sx={{display: 'flex'}}>
                <div>
                  <BranchName>{restrictedCommit.oid}</BranchName>
                </div>
                {!readOnly ? (
                  <IconButton
                    type="button"
                    aria-label="Remove"
                    variant="invisible"
                    size="small"
                    icon={TrashIcon}
                    onClick={() => {
                      removeRestrictedCommitFromList(restrictedCommit)
                    }}
                  />
                ) : null}
              </Box>
              {restrictedCommit.reason && (
                <div>
                  <p>{restrictedCommit.reason}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </BorderBox>
  )
}
