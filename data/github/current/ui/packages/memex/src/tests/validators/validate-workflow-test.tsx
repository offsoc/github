import {MemexActionType} from '../../client/api/workflows/contracts'
import {validateAction, validateWorkflow, validateWorkflowName} from '../../client/helpers/workflow-validation'
import {WorkflowResources} from '../../client/strings'
import {autoAddItemsWorkflowPersisted, invalidAutoAddItemsWorkflowPersisted} from '../../mocks/data/workflows'

describe('validateWorkflow', () => {
  it('returns isValid true and empty error message when there are actions and contentTypes in the workflow', () => {
    const {isValid, errorMessage} = validateWorkflow(autoAddItemsWorkflowPersisted)
    expect(isValid).toBe(true)
    expect(errorMessage).toBeUndefined()
  })

  it('returns isValid false and error message when actions is empty', () => {
    const {isValid, errorMessage} = validateWorkflow({...autoAddItemsWorkflowPersisted, actions: []})
    expect(isValid).toEqual(false)
    expect(errorMessage).toEqual(WorkflowResources.invalidNoAction)
  })

  it('returns isValid false and error message when it contains invalid action', () => {
    const {isValid, errorMessage} = validateWorkflow(invalidAutoAddItemsWorkflowPersisted)
    expect(isValid).toEqual(false)
    expect(errorMessage).toEqual(WorkflowResources.invalidNoRepository)
  })

  it('validates workflow name when workflowNames is provided', () => {
    const workflowNames: ReadonlySet<string> = new Set()
    const {isValid, errorMessage} = validateWorkflowName('', workflowNames)
    expect(isValid).toBe(false)
    expect(errorMessage).toBe(WorkflowResources.emptyWorkflowName)
  })
})

describe('validateAction', () => {
  describe('SetField', () => {
    it('returns isValid false and error message when action contains invalid fieldId', () => {
      const invalidSetFieldAction = {
        actionType: MemexActionType.SetField,
        arguments: {fieldId: 0, fieldOptionId: '1'},
      }

      const {isValid, errorMessage} = validateAction(invalidSetFieldAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidActionField)
    })

    it('returns isValid false and error message when action contains invalid fieldOptionId', () => {
      const invalidSetFieldAction = {
        actionType: MemexActionType.SetField,
        arguments: {fieldId: 1, fieldOptionId: ''},
      }

      const {isValid, errorMessage} = validateAction(invalidSetFieldAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidActionFieldValue)
    })
  })

  describe('GetProjectItems', () => {
    it('returns isValid false and error message when action contains empty query AND empty field id', () => {
      const invalidGetProjectItemsAction = {
        actionType: MemexActionType.GetProjectItems,
        arguments: {query: '', fieldId: undefined},
      }

      const {isValid, errorMessage} = validateAction(invalidGetProjectItemsAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidNoQueryOrFieldId)
    })

    it('returns isValid false and error message when action contains a field id but no field option id', () => {
      const invalidGetProjectItemsAction = {
        actionType: MemexActionType.GetProjectItems,
        arguments: {fieldId: 2, fieldOptionId: undefined},
      }

      const {isValid, errorMessage} = validateAction(invalidGetProjectItemsAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidActionFieldValue)
    })

    it('returns isValid true and no error message when query is provided', () => {
      const invalidGetProjectItemsAction = {
        actionType: MemexActionType.GetProjectItems,
        arguments: {query: 'is:closed', fieldId: undefined},
      }

      const {isValid, errorMessage} = validateAction(invalidGetProjectItemsAction)

      expect(isValid).toEqual(true)
      expect(errorMessage).toBeFalsy()
    })

    it('returns isValid true and no error message when either field id and field option id are provided', () => {
      const invalidGetProjectItemsAction = {
        actionType: MemexActionType.GetProjectItems,
        arguments: {fieldId: 2, fieldOptionId: '3'},
      }

      const {isValid, errorMessage} = validateAction(invalidGetProjectItemsAction)

      expect(isValid).toEqual(true)
      expect(errorMessage).toBeFalsy()
    })
  })

  describe('GetItems', () => {
    it('returns isValid true and empty error message when action contains empty query', () => {
      const validGetItemsAction = {
        actionType: MemexActionType.GetItems,
        arguments: {query: ''},
      }

      const {isValid, errorMessage} = validateAction(validGetItemsAction)

      expect(isValid).toEqual(true)
      expect(errorMessage).toBeUndefined()
    })

    it('returns isValid true and empty error message when action contains empty repositoryId but is not yet persisted', () => {
      const validGetItemsAction = {
        actionType: MemexActionType.GetItems,
        arguments: {query: 'is:open'},
      }

      const {isValid, errorMessage} = validateAction(validGetItemsAction)

      expect(isValid).toEqual(true)
      expect(errorMessage).toBeUndefined()
    })

    it('returns isValid false and error message when action contains undefined query', () => {
      const invalidGetItemsAction = {
        actionType: MemexActionType.GetItems,
        arguments: {query: undefined},
      }

      const {isValid, errorMessage} = validateAction(invalidGetItemsAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidNoQuery)
    })

    it('returns isValid false and error message when action contains empty repositoryId and is persisted', () => {
      const invalidGetItemsAction = {
        id: 1,
        actionType: MemexActionType.GetItems,
        arguments: {query: 'is:open'},
      }

      const {isValid, errorMessage} = validateAction(invalidGetItemsAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidNoRepository)
    })
  })

  describe('AddProjectItem', () => {
    it('returns isValid true and empty error message when action contains empty repositoryId but is not yet persisted', () => {
      const validAddProjectItemAction = {
        actionType: MemexActionType.AddProjectItem,
        arguments: {},
      }

      const {isValid, errorMessage} = validateAction(validAddProjectItemAction)

      expect(isValid).toEqual(true)
      expect(errorMessage).toBeUndefined()
    })

    it('returns isValid false and error message when action contains empty repositoryId and is persisted', () => {
      const invalidAddProjectItemAction = {
        id: 2,
        actionType: MemexActionType.AddProjectItem,
        arguments: {},
      }

      const {isValid, errorMessage} = validateAction(invalidAddProjectItemAction)

      expect(isValid).toEqual(false)
      expect(errorMessage).toEqual(WorkflowResources.invalidNoRepository)
    })
  })
})

describe('validateWorkflowName', () => {
  it('returns isValid true and empty error message when workflow name is valid', () => {
    const workflowNames: ReadonlySet<string> = new Set(['existing workflow name'])
    const {isValid, errorMessage} = validateWorkflowName('New workflow name', workflowNames)
    expect(isValid).toBe(true)
    expect(errorMessage).toBeUndefined()
  })

  it('returns isValid false and error message when workflow name already exists', () => {
    const workflowNames: ReadonlySet<string> = new Set(['existing workflow name'])
    const {isValid, errorMessage} = validateWorkflowName('  EXISTING WORKFLOW name   ', workflowNames)
    expect(isValid).toBe(false)
    expect(errorMessage).toBe(WorkflowResources.duplicateWorkflowName)
  })

  it('returns isValid false and error message when workflow name is empty', () => {
    const workflowNames: ReadonlySet<string> = new Set()
    const {isValid, errorMessage} = validateWorkflowName('', workflowNames)
    expect(isValid).toBe(false)
    expect(errorMessage).toBe(WorkflowResources.emptyWorkflowName)
  })

  it('returns isValid false and error message when workflow name only contains empty spaces', () => {
    const workflowNames: ReadonlySet<string> = new Set()
    const {isValid, errorMessage} = validateWorkflowName('   ', workflowNames)
    expect(isValid).toBe(false)
    expect(errorMessage).toBe(WorkflowResources.emptyWorkflowName)
  })

  it('returns isValid false and error message when workflow name is longer than 250 characters', () => {
    const workflowNames: ReadonlySet<string> = new Set()
    const {isValid, errorMessage} = validateWorkflowName('new workflow'.repeat(26), workflowNames)
    expect(isValid).toBe(false)
    expect(errorMessage).toBe(WorkflowResources.workflowNameTooLong)
  })
})
