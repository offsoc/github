import type {Rule, RuleSchema} from '../types/rules-types'

export function getRuleSchemasByType(ruleSchemas: RuleSchema[]) {
  return ruleSchemas.reduce<Record<string, RuleSchema>>((record, ruleSchema) => {
    record[ruleSchema.type] = ruleSchema
    return record
  }, {})
}

export function generateMetadataDescription(rule: Rule, ruleSchema: RuleSchema, includePattern = false) {
  if (!ruleSchema.metadataPatternSchema?.propertyDescription) {
    return undefined
  }

  const operatorDescription = ruleSchema.metadataPatternSchema?.supportedOperators?.find(
    supportedOperator => supportedOperator.type === rule.parameters.operator,
  )?.displayName

  if (!operatorDescription) {
    return undefined
  }

  return `${ruleSchema.metadataPatternSchema.propertyDescription} must${
    rule.parameters.negate ? ' not ' : ' '
  }${operatorDescription}${includePattern ? ` ${rule.parameters.pattern || ''}` : ''}`
}
