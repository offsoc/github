import {filterEmptyOptions, type SettingsOption} from '../../client/helpers/new-column'

describe('add field helpers', () => {
  describe('filterNamedOptions', () => {
    it('ignores empty strings when filtering', () => {
      const settings: Array<SettingsOption> = [{name: '', id: '', description: '', color: 'BLUE'}]
      expect(filterEmptyOptions(settings)).toHaveLength(0)
    })

    it('matches when name is set', () => {
      const settings: Array<SettingsOption> = [{name: 'Foo', id: '', description: '', color: 'BLUE'}]
      expect(filterEmptyOptions(settings)).toMatchObject(settings)
    })
  })
})
