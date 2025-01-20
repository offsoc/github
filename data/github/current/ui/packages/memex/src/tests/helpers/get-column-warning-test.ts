import {getColumnWarning} from '../../client/helpers/get-column-warning'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {createColumnModel} from '../../client/models/column-model'
import {org, users} from '../../mocks/data/users-list'
import {seedJSONIsland} from '../../mocks/server/mock-server'
import {customColumnFactory} from '../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../factories/columns/system-column-factory'

function seedIslands() {
  seedJSONIsland('memex-user-notices', ['memex_issue_types_rename_prompt'])
  seedJSONIsland('memex-enabled-features', ['issue_types'])
  seedJSONIsland('memex-viewer-privileges', {role: 'admin', canChangeProjectVisibility: true, canCopyAsTemplate: true})
  seedJSONIsland('memex-owner', org)
}

const customTypeColumn = createColumnModel(customColumnFactory.text().build({name: 'Type'}))

describe('getColumnWarning', () => {
  beforeEach(() => {
    seedIslands()
  })

  it('should return undefined if column is system defined type column', () => {
    const column = systemColumnFactory.issueType().build()
    const warning = getColumnWarning(createColumnModel(column))
    expect(warning).toBeUndefined()
  })

  it('should return undefined if user does not have issue_types', () => {
    seedJSONIsland('memex-enabled-features', [])

    expect(getColumnWarning(customTypeColumn)).toBeUndefined()
  })

  it('should return undefined if owner is not org', () => {
    seedJSONIsland('memex-owner', {...not_typesafe_nonNullAssertion(users[0]), type: 'user'})

    expect(getColumnWarning(customTypeColumn)).toBeUndefined()
  })

  it('should return undefined if column is not named type', () => {
    const warning = getColumnWarning(createColumnModel(customColumnFactory.text().build({name: 'Custom Type'})))
    expect(warning).toBeUndefined()
  })

  it('should return warning if custom type column is org-owned', () => {
    expect(getColumnWarning(customTypeColumn)).toBe('rename-custom-type-column')
  })
})
