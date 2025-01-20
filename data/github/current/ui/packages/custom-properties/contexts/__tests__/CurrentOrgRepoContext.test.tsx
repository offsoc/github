import {renderPropertyDefinitionsComponent, renderRepoSettingsCustomPropertiesComponent} from '../../test-utils/Render'
import {useCurrentOrg, useCurrentRepo} from '../CurrentOrgRepoContext'

describe('CurrentOrgRepoProvider', () => {
  it('retrieves the organization name from the current URL', async () => {
    let orgLogin = 'unset'
    const SampleComponent = () => {
      const org = useCurrentOrg()
      orgLogin = org.login
      return null
    }

    expect('unset').toBe(orgLogin)

    renderPropertyDefinitionsComponent(<SampleComponent />)

    expect('acme').toBe(orgLogin)
  })

  it('retrieves the owner and repo name from the current URL', async () => {
    let orgLogin = 'unset'
    let repoName = 'unset'
    const SampleComponent = () => {
      const org = useCurrentOrg()
      orgLogin = org.login
      const repo = useCurrentRepo()
      repoName = repo.name
      return null
    }

    expect(orgLogin).toBe('unset')
    expect(repoName).toBe('unset')

    renderRepoSettingsCustomPropertiesComponent(<SampleComponent />)

    expect(orgLogin).toBe('acme')
    expect(repoName).toBe('smile')
  })
})
