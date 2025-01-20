import type {FC} from 'react'
import {Box, Text, IconButton, Truncate} from '@primer/react'
import {PencilIcon, ReplyIcon, TrashIcon} from '@primer/octicons-react'
import {RuleModalState, type Rule, type RuleSchema} from '../../types/rules-types'
import {generateMetadataDescription} from '../../helpers/rule-schema'

interface MetadataPatternRuleRowProps {
  rule: Rule
  ruleSchema: RuleSchema
  readOnly: boolean
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
}

export const MetadataPatternRuleRow: FC<MetadataPatternRuleRowProps> = ({
  rule,
  ruleSchema,
  readOnly,
  removeRule,
  restoreRule,
  setRuleModalState,
}) => {
  const {pattern} = rule.parameters

  let description = rule.parameters.name as string | undefined

  if (!description) {
    description = generateMetadataDescription(rule, ruleSchema)
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          maxWidth: 'calc(100% - 120px)',
          overflowX: 'hidden',
          mr: 2,
        }}
      >
        <Box sx={{maxWidth: '100%'}}>
          <Text as="label" sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
            <Box as="span" sx={{mr: 1}}>
              {description}
            </Box>
            <Truncate
              title={pattern as string}
              sx={{
                maxWidth: 200,
                color: 'accent.fg',
                px: 1,
                whiteSpace: 'nowrap',
                backgroundColor: 'accent.subtle',
                borderRadius: 2,
              }}
            >
              <Text
                sx={{
                  overflowX: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {pattern as string | undefined}
              </Text>
            </Truncate>
          </Text>
        </Box>
      </Box>
      {readOnly ? null : (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {rule._enabled ? (
            <>
              <IconButton
                type="button"
                icon={PencilIcon}
                aria-label="Edit this metadata rule"
                size="small"
                variant="invisible"
                onClick={() => {
                  setRuleModalState(rule, RuleModalState.EDITING)
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              />
              <IconButton
                sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                icon={TrashIcon}
                type="button"
                size="small"
                variant="invisible"
                onClick={() => removeRule(rule)}
                aria-label="Delete this metadata rule"
              />
            </>
          ) : (
            <IconButton
              type="button"
              icon={ReplyIcon}
              aria-label="Restore this metadata rule"
              size="small"
              variant="invisible"
              onClick={() => restoreRule(rule)}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            />
          )}
        </Box>
      )}
    </>
  )
}
