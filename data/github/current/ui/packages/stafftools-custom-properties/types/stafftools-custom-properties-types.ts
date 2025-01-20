export type CustomPropertyDefinitionSummaryPayload = {
  definitions: Array<{
    name: string
    required: boolean
    defaultValue: string
  }>
}

export type CustomPropertyDefinitionPayload = {
  definition: {
    name: string
    required: boolean
    defaultValue: string | null
    description: string
    valueType: string
    allowedValues: string[] | null
  }
}
