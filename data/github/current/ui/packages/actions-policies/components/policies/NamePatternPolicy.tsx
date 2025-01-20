import {FormControl, Textarea, Text, Box} from '@primer/react'
import {PolicyHeader} from './PolicyHeader'
import {PolicyContent} from './PolicyContent'
import type {Index, PolicyFormWrapper} from '../../types'

const LINES: string[] = [
  'Action examples: octo-org/octo-repo@*, octo-org/octo-repo@v2',
  'Reusable workflow examples: octo-org/octo-repo/.github/workflows/build.yml@main',
  'Entire organization or repository examples: octo-org/*, octo-org/octo-repo/*',
]

export const NamePatternPolicy: React.FC<PolicyFormWrapper & Index> = ({form, setPolicyForm, idx}) => {
  return (
    <PolicyHeader
      title="Allow specified actions and reusable workflows"
      idx={idx}
      description="Use patterns to target allowed actions or reusable workflows in this policy."
    >
      <PolicyContent>
        <FormControl>
          <Textarea
            value={form.patterns}
            block
            resize="vertical"
            onChange={e => {
              setPolicyForm({
                ...form,
                patterns: e.target.value,
              })
            }}
          />
          <FormControl.Label>Workflow patterns</FormControl.Label>
          <FormControl.Caption>
            <span>
              Enter a comma-separated list of actions and reusable workflow patterns. Wildcards, tags, and SHAs are
              allowed.
            </span>
          </FormControl.Caption>
        </FormControl>
        <Box sx={{marginTop: 2}}>
          {LINES.map((line, lineIdx) => {
            return (
              <Text key={lineIdx} as="p" sx={{color: 'fg.muted', fontSize: '12px', marginBottom: 0}}>
                {line}
              </Text>
            )
          })}
        </Box>
      </PolicyContent>
    </PolicyHeader>
  )
}
