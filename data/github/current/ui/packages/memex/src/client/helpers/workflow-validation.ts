import {MemexActionType, type MemexWorkflow, type MemexWorkflowAction} from '../api/workflows/contracts'
import {parseFullTextQuery} from '../components/filter-bar/helpers/search-filter'
import {WorkflowResources as Resources} from '../strings'

interface ValidationResult {
  errorMessage?: string
  isValid: boolean
}

const MAX_WORKFLOW_NAME_LENGTH = 250

export const validateWorkflowName = (name: string, workflowNames: ReadonlySet<string>): ValidationResult => {
  const normalizedName = name.toLocaleLowerCase().trim()

  if (normalizedName.length === 0) {
    return createResult(Resources.emptyWorkflowName)
  }

  if (normalizedName.length > MAX_WORKFLOW_NAME_LENGTH) {
    return createResult(Resources.workflowNameTooLong)
  }

  if (workflowNames.has(normalizedName)) {
    return createResult(Resources.duplicateWorkflowName)
  }

  return createResult()
}

/**
 * Provides basic workflow validation by verifying the existence of required property values
 *
 * @param workflow the Memex workflow to check
 * @param workflowNames optional set of workflow names to check against; skips name validation if not provided
 * @returns true if it passes superficial valid checks
 */
export const validateWorkflow = (workflow: MemexWorkflow, workflowNames?: ReadonlySet<string>): ValidationResult => {
  if (!workflow.actions.length) {
    return createResult(Resources.invalidNoAction)
  }
  if (!workflow.contentTypes.length) {
    return createResult(Resources.invalidNoContentType)
  }

  if (workflowNames) {
    const workflowNameValidation = validateWorkflowName(workflow.name, workflowNames)
    if (!workflowNameValidation.isValid) {
      return workflowNameValidation
    }
  }

  for (const action of workflow.actions) {
    const actionValidation = validateAction(action)
    if (!actionValidation.isValid) {
      return actionValidation
    }
  }
  return createResult()
}

/**
 * Provides basic workflow action validation by verifying the existence of required property values
 *
 * @param action the Memex workflow action to check
 * @returns true if it passes superficial valid checks
 */
export const validateAction = (action: MemexWorkflowAction): ValidationResult => {
  switch (action.actionType) {
    case MemexActionType.SetField:
      if (!action.arguments.fieldId) {
        return createResult(Resources.invalidActionField)
      }
      if (!action.arguments.fieldOptionId) {
        return createResult(Resources.invalidActionFieldValue)
      }
      break
    case MemexActionType.GetProjectItems: {
      const {query, fieldId, fieldOptionId} = action.arguments
      if (!query) {
        // if both are absent
        if (!fieldId) {
          return createResult(Resources.invalidNoQueryOrFieldId)
          // if query is absent but fieldId is present
        } else {
          if (!fieldOptionId) return createResult(Resources.invalidActionFieldValue)
        }
      } else {
        return validateQuery(action)
      }
      break
    }
    case MemexActionType.GetItems: {
      if (typeof action.arguments.query !== 'string') {
        return createResult(Resources.invalidNoQuery)
      }
      if (!action.arguments.repositoryId && action.id) {
        return createResult(Resources.invalidNoRepository)
      }
      break
    }
    case MemexActionType.AddProjectItem: {
      if (!action.arguments.subIssue && !action.arguments.repositoryId && action.id) {
        return createResult(Resources.invalidNoRepository)
      }
      break
    }
    default:
      break
  }
  return createResult()
}

const validateQuery = (action: MemexWorkflowAction): ValidationResult => {
  const parsedQuery = action.arguments.query && parseFullTextQuery(action.arguments.query)

  if (parsedQuery) {
    for (const token of parsedQuery.orderedTokenizedFilters) {
      if (token.type === 'search') continue
      // for auto-archive, we only allow last-updated filter and not column filters
      if (
        action.actionType === MemexActionType.GetProjectItems &&
        token.type === 'field' &&
        (token.field === 'last-updated' || token.field === 'updated')
      )
        continue
      if (token.type === 'field') return createResult(Resources.invalidQuery)
    }
  }

  return createResult()
}

const createResult = (errorMessage?: string): ValidationResult => {
  return {
    errorMessage,
    isValid: !errorMessage,
  }
}
