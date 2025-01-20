import type {RepositoryPathAction} from '../path'
import {
  advancedSearchPath,
  branchPath,
  checkPropertyUsagePath,
  commitHovercardPath,
  commitPath,
  commitsByAuthor,
  commitsPath,
  commitsPathByAuthor,
  commitStatusDetailsPath,
  comparePath,
  customPropertyDetailsPath,
  extractPathFromPathname,
  forkPath,
  forksListPath,
  newRepoPath,
  orgOnboardingAdvancedSecurityPath,
  orgReposIndexPath,
  ownerAvatarPath,
  ownerPath,
  parentPath,
  propertyDefinitionSettingsPath,
  repoDefaultBrachUrl,
  repoOverviewUrl,
  repoOwnerDetailPath,
  repositoryPath,
  repositoryPropertiesSettingsPath,
  repositoryTreePath,
  reposSurveyPath,
  searchPath,
  tagPath,
  treeListPath,
  userHovercardPath,
  actionsWorkflowFilePath,
  actionsWorkflowRunPath,
  repoAttestationsIndexPath,
  repoAttestationShowPath,
  repoAttestationDownloadPath,
  enterprisePath,
  fullUrl,
  orgRulesetsTargetCountPath,
  repoRulesetsTargetCountPath,
  orgRepositoriesPath,
  stafftoolsOrgRulesetsTargetCountPath,
  stafftoolsRepoRulesetsTargetCountPath,
  checkPropertyNamePath,
} from '../path'
import {getRelativeHref} from '../utils'

describe('parentPath', () => {
  test('returns correct parent path', () => {
    expect(parentPath('/a/b/c')).toEqual('/a/b')
    expect(parentPath('/a')).toEqual('')
    expect(parentPath('')).toEqual('')
  })
})

describe('commitStatusDetailsPath', () => {
  test('returns valid url', () => {
    expect(
      commitStatusDetailsPath({ownerLogin: 'monalisa', name: 'smile'}, 'a1b2c3d4e5a1b2c3d4e5a1b2c3d4e5a1b2c3d4e5'),
    ).toEqual('/monalisa/smile/commit/a1b2c3d4e5a1b2c3d4e5a1b2c3d4e5a1b2c3d4e5/status-details')
  })
})

describe('commitsPathByAuthor', () => {
  it('returns valid url', () => {
    expect(
      commitsPathByAuthor({
        repo: {ownerLogin: 'monalisa', name: 'smile'},
        branch: 'main',
        path: 'a/b/c',
        author: 'octocat',
      }),
    ).toEqual('/monalisa/smile/commits/main/a/b/c?author=octocat')
  })
})

describe('repositoryTreePath', () => {
  const sampleArgs = {
    repo: {ownerLogin: 'owner', name: 'repo'},
    commitish: 'main',
  }

  test('returns correct repository tree path', () => {
    expect(
      repositoryTreePath({
        ...sampleArgs,
        action: 'tree',
        path: 'directoryPath',
      }),
    ).toEqual('/owner/repo/tree/main/directoryPath')
  })

  test('does not add extra slash if no path', () => {
    expect(
      repositoryTreePath({
        ...sampleArgs,
        action: 'tree',
      }),
    ).toEqual('/owner/repo/tree/main')
  })

  test('does not add extra slash if path is "/"', () => {
    expect(
      repositoryTreePath({
        ...sampleArgs,
        action: 'tree',
        path: '/',
      }),
    ).toEqual('/owner/repo/tree/main')
  })

  test('returns correct repository blob path', () => {
    expect(
      repositoryTreePath({
        ...sampleArgs,
        action: 'blob',
        path: 'blobPath',
      }),
    ).toEqual('/owner/repo/blob/main/blobPath')
  })

  test('encodes special characters', () => {
    expect(
      repositoryTreePath({
        repo: {ownerLogin: 'sigurrós', name: '你好'},
        commitish: 'lang/C#',
        action: 'tree',
        path: 'C#/lib',
      }),
    ).toEqual('/sigurr%C3%B3s/%E4%BD%A0%E5%A5%BD/tree/lang/C%23/C%23/lib')
  })
})

describe('comparePath', () => {
  test('returns correct compare path', async () => {
    expect(
      comparePath({
        repo: {ownerLogin: 'mona', name: 'smile'},
        base: 'feature',
        head: 'main',
      }),
    ).toEqual('/mona/smile/compare/feature...main')
  })

  test('encodes special characters', async () => {
    expect(
      comparePath({
        repo: {ownerLogin: 'sigurrós', name: '你好'},
        base: 'tree',
        head: 'C#/lib',
      }),
    ).toEqual('/sigurr%C3%B3s/%E4%BD%A0%E5%A5%BD/compare/tree...C%23/lib')
  })
})

describe('commitsByAuthor', () => {
  test('returns corrent commit author path', async () => {
    expect(
      commitsByAuthor({
        repo: {ownerLogin: 'mona', name: 'smile'},
        author: 'mona' as string,
      }),
    ).toEqual('/mona/smile/commits?author=mona')
  })

  test('encodes special characters', async () => {
    expect(
      commitsByAuthor({
        repo: {ownerLogin: '你好你', name: '笑容'},
        author: '你好' as string,
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commits?author=%E4%BD%A0%E5%A5%BD')
  })
})

describe('commitHovercardPath', () => {
  test('returns corrent commit hovercard path', async () => {
    expect(
      commitHovercardPath({
        owner: 'mona',
        repo: 'smile',
        commitish: '1234abcd',
      }),
    ).toEqual('/mona/smile/commit/1234abcd/hovercard')
  })

  test('encodes special characters', async () => {
    expect(
      commitHovercardPath({
        owner: '你好你',
        repo: '笑容',
        commitish: '1234abcd',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commit/1234abcd/hovercard')
  })
})

describe('searchPath', () => {
  test('returns corrent path', async () => {
    expect(searchPath(undefined)).toEqual('/search')
  })
})

describe('advancedSearchPath', () => {
  test('returns corrent path', async () => {
    expect(advancedSearchPath()).toEqual('/search/advanced')
  })
})

describe('ownerPath', () => {
  test('returns corrent path', async () => {
    expect(
      ownerPath({
        owner: 'mona',
      }),
    ).toEqual('/mona')
  })

  test('encodes special characters', async () => {
    expect(
      ownerPath({
        owner: '你好你',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0')
  })
})

describe('ownerAvatarPath', () => {
  test('returns corrent path', async () => {
    expect(
      ownerAvatarPath({
        owner: 'mona',
      }),
    ).toEqual('/mona.png')
  })

  test('encodes special characters', async () => {
    expect(
      ownerAvatarPath({
        owner: '你好你',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0.png')
  })
})

describe('userHovercardPath', () => {
  test('returns corrent path', async () => {
    expect(
      userHovercardPath({
        owner: 'mona',
      }),
    ).toEqual('/users/mona/hovercard')
  })

  test('encodes special characters', async () => {
    expect(
      userHovercardPath({
        owner: '你好你',
      }),
    ).toEqual('/users/%E4%BD%A0%E5%A5%BD%E4%BD%A0/hovercard')
  })
})

describe('repositoryPath', () => {
  test('returns corrent path when no param', async () => {
    expect(
      repositoryPath({
        owner: 'mona',
        repo: 'smile',
      }),
    ).toEqual('/mona/smile')
  })

  test('encodes special characters when no param', async () => {
    expect(
      repositoryPath({
        owner: '你好你',
        repo: '笑容',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9')
  })

  const actions: RepositoryPathAction[] = [
    'hovercard',
    'refs',
    'actions',
    'pulls',
    'issues',
    'issues/new',
    'branches',
    'tags',
  ]

  test.each(actions)('returns correct path with %s param', async action => {
    expect(
      repositoryPath({
        owner: 'mona',
        repo: 'smile',
        action,
      }),
    ).toEqual(`/mona/smile/${action}`)
  })

  test.each(actions)('encodes special characters with %s param', async action => {
    expect(
      repositoryPath({
        owner: '你好你',
        repo: '笑容',
        action,
      }),
    ).toEqual(`/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/${action}`)
  })
})

describe('branchPath', () => {
  test('returns correct compare path', async () => {
    expect(
      branchPath({
        owner: 'mona',
        repo: 'smile',
        branch: 'master',
      }),
    ).toEqual('/mona/smile/tree/master')
  })

  test('encodes special characters', async () => {
    expect(
      branchPath({
        owner: '你好你',
        repo: '笑容',
        branch: 'master容',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/tree/master%E5%AE%B9')
  })
})

describe('commitPath', () => {
  it('returns correct path', async () => {
    expect(
      commitPath({
        owner: 'mona',
        repo: 'smile',
        commitish: '1234abcd',
      }),
    ).toEqual(`/mona/smile/commit/1234abcd`)
  })

  it('encodes special characters', async () => {
    expect(
      commitPath({
        owner: '你好你',
        repo: '笑容',
        commitish: '1234abcd',
      }),
    ).toEqual(`/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commit/1234abcd`)
  })
})

describe('tagPath', () => {
  it('returns correct path', async () => {
    expect(
      tagPath({
        owner: 'mona',
        repo: 'smile',
        tag: 'v1.0.0',
      }),
    ).toEqual(`/mona/smile/releases/tag/v1.0.0`)
  })

  it('encodes special characters', async () => {
    expect(
      tagPath({
        owner: '你好你',
        repo: '笑容',
        tag: 'v1.0.0',
      }),
    ).toEqual(`/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/releases/tag/v1.0.0`)
  })
})

describe('reposSurveyPath', () => {
  test('returns correct url when no action', async () => {
    expect(reposSurveyPath({ownerLogin: 'monalisa', name: 'smile'})).toEqual('/monalisa/smile/repos/survey')
  })

  test('returns correct url when action is dismiss', async () => {
    expect(reposSurveyPath({ownerLogin: 'monalisa', name: 'smile'}, 'dismiss')).toEqual(
      '/monalisa/smile/repos/survey/dismiss',
    )
  })
  test('returns correct url when action is answer', async () => {
    expect(reposSurveyPath({ownerLogin: 'monalisa', name: 'smile'}, 'answer')).toEqual(
      '/monalisa/smile/repos/survey/answer',
    )
  })
})

describe('treeListPath', () => {
  test('returns correct url when no action', async () => {
    expect(
      treeListPath({
        repo: {ownerLogin: 'monalisa', name: 'smile'},
        commitOid: '1234abcd',
      }),
    ).toEqual('/monalisa/smile/tree-list/1234abcd')
  })

  test('encodes special characters', async () => {
    expect(
      treeListPath({
        repo: {ownerLogin: '你好你', name: '笑容'},
        commitOid: '1234abcd',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/tree-list/1234abcd')
  })

  test('can set include_directories', async () => {
    expect(
      treeListPath({
        repo: {ownerLogin: 'monalisa', name: 'smile'},
        commitOid: '1234abcd',
        includeDirectories: true,
      }),
    ).toEqual('/monalisa/smile/tree-list/1234abcd?include_directories=true')
  })
})

describe('extractPathFromPathname', () => {
  it('returns the new path when the branch has not changed', async () => {
    const pathname = '/monalisa/smile/tree/main/folder/new-path'
    expect(extractPathFromPathname(pathname, 'main', 'old-path')).toEqual('folder/new-path')
  })

  it('returns the old path when the branch changes, even if the old branch name is present as a folder in the path', async () => {
    const pathname = '/monalisa/smile/tree/other-branch/main/new-path'
    expect(extractPathFromPathname(pathname, 'main', 'old-path')).toEqual('old-path')
  })

  it('returns the old path when the branch changes, even if the old branch name is present as a nested folder in the path', async () => {
    const pathname = '/monalisa/smile/tree/other-branch/folderA/main/file.md'
    expect(extractPathFromPathname(pathname, 'main', 'old-path')).toEqual('old-path')
  })

  it('returns the new path when the branch does not change, even if the path includes a subfolder with the branch name', async () => {
    const pathname = '/monalisa/smile/tree/main/folder/main/new-path'
    expect(extractPathFromPathname(pathname, 'main', 'old-path')).toEqual('folder/main/new-path')
  })

  it('returns old path when the branch changes', async () => {
    const pathname = '/monalisa/smile/tree/new-branch/new-path'
    expect(extractPathFromPathname(pathname, 'main', 'old-path')).toEqual('old-path')
  })

  it('returns no path when the branch does not change and new url has no path', async () => {
    const pathname = '/monalisa/smile/tree/same-branch'
    expect(extractPathFromPathname(pathname, 'same-branch', 'old-path')).toEqual('')
  })

  it('returns old path when the branch changes and its name starts with old branch name', async () => {
    const pathname = '/monalisa/smile/tree/main-new/new-path'
    expect(extractPathFromPathname(pathname, 'old-branch', 'old-path')).toEqual('old-path')
  })

  it('returns old path when the branch changes even if new url has no path', async () => {
    const pathname = '/monalisa/smile/tree/new-branch'
    expect(extractPathFromPathname(pathname, 'old-branch', 'old-path')).toEqual('old-path')
  })

  it('returns old path when the path does not include the branch neither the path', async () => {
    const pathname = '/monalisa/smile/tree'
    expect(extractPathFromPathname(pathname, 'old-branch', 'old-path')).toEqual('old-path')
  })
})

describe('getRelativeHref', () => {
  it('returns the href without the origin', async () => {
    const pathname = '/path/to/something'
    expect(getRelativeHref(() => pathname, undefined, {some: 'value'})).toEqual('/path/to/something?some=value')
  })

  it('returns the href without the origin even when in pathname', async () => {
    const pathname = 'http://some-where.com/path/after/origin'
    expect(getRelativeHref(() => pathname, undefined, {a: 'b'})).toEqual('/path/after/origin?a=b')
  })
})

describe('repoOverviewUrl', () => {
  it('returns the overview repo', async () => {
    expect(repoOverviewUrl({ownerLogin: 'monalisa', name: 'smile'})).toEqual('/monalisa/smile')
  })

  it('encodes special characters', async () => {
    expect(repoOverviewUrl({ownerLogin: '你好你', name: '笑容'})).toEqual(
      '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9',
    )
  })
})

describe('repoDefaultBrachUrl', () => {
  it('returns the overview repo', async () => {
    expect(repoDefaultBrachUrl({ownerLogin: 'monalisa', name: 'smile'})).toEqual('/monalisa/smile?files=1')
  })

  it('encodes special characters', async () => {
    expect(repoDefaultBrachUrl({ownerLogin: '你好你', name: '笑容'})).toEqual(
      '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9?files=1',
    )
  })
})

describe('commitsPath', () => {
  it('returns commits path', () => {
    expect(commitsPath({repo: 'smile', owner: 'monalisa', path: 'readme.md', ref: 'master'})).toEqual(
      '/monalisa/smile/commits/master/readme.md',
    )
  })

  it('encodes special characters if no ref', () => {
    expect(commitsPath({repo: '笑容', owner: '你好你'})).toEqual(
      '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commits',
    )
  })

  it('encodes special characters', () => {
    expect(commitsPath({repo: '笑容', owner: '你好你', path: '笑容?.md', ref: 'branch_笑容'})).toEqual(
      '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commits/branch_%E7%AC%91%E5%AE%B9/%E7%AC%91%E5%AE%B9%3F.md',
    )
  })

  it('encodes special characters if path is missing', () => {
    expect(commitsPath({repo: '笑容', owner: '你好你', ref: 'branch_笑容'})).toEqual(
      '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/commits/branch_%E7%AC%91%E5%AE%B9',
    )
  })
})

describe('orgOnboardingAdvancedSecurityPath', () => {
  it('gets Advanced Security onboarding path for a given organization', () => {
    expect(orgOnboardingAdvancedSecurityPath({org: 'acme'})).toEqual(
      '/orgs/acme/organization_onboarding/advanced_security',
    )
  })
})

describe('repoOwnerDetailPath', () => {
  it('gets path for the details of a given owner', () => {
    expect(repoOwnerDetailPath('acme')).toEqual('/repositories/forms/owner_detail?owner=acme')
  })

  it('gets path for the details of a given owner and action', () => {
    expect(repoOwnerDetailPath('acme', 'transfer', 1)).toEqual(
      '/repositories/forms/owner_detail?owner=acme&form=transfer&repo_id=1',
    )
  })

  it('encodes special characters', () => {
    expect(repoOwnerDetailPath('笑容')).toEqual('/repositories/forms/owner_detail?owner=%E7%AC%91%E5%AE%B9')
  })
})

describe('propertyDefinitionSettingsPath', () => {
  it('gets path for the schema of an org', () => {
    expect(propertyDefinitionSettingsPath({pathPrefix: 'organizations', sourceName: 'acme'})).toEqual(
      '/organizations/acme/settings/custom-properties',
    )
  })

  it('gets path for one definition in an org', () => {
    expect(
      propertyDefinitionSettingsPath({pathPrefix: 'organizations', sourceName: 'acme', propertyName: 'environment'}),
    ).toEqual('/organizations/acme/settings/custom-property/environment')
  })

  it('gets path for the schema of an enterprise', () => {
    expect(propertyDefinitionSettingsPath({pathPrefix: 'enterprises', sourceName: 'acme'})).toEqual(
      '/enterprises/acme/settings/custom-properties',
    )
  })

  it('gets path for one definition in an enterprise', () => {
    expect(
      propertyDefinitionSettingsPath({pathPrefix: 'enterprises', sourceName: 'acme', propertyName: 'environment'}),
    ).toEqual('/enterprises/acme/settings/custom-property/environment')
  })
})

describe('checkPropertyNamePath', () => {
  it('returns path', () => {
    expect(checkPropertyNamePath({sourceName: 'acme', propertyName: 'environment'})).toEqual(
      '/enterprises/acme/settings/property_definition_name_check/environment',
    )
  })

  it('encodes special characters', () => {
    expect(checkPropertyNamePath({sourceName: '笑容', propertyName: '你好你'})).toEqual(
      '/enterprises/%E7%AC%91%E5%AE%B9/settings/property_definition_name_check/%E4%BD%A0%E5%A5%BD%E4%BD%A0',
    )
  })
})

describe('customPropertyDetailsPath', () => {
  it('gets path for property create page', () => {
    expect(customPropertyDetailsPath({pathPrefix: 'organizations', sourceName: 'acme'})).toEqual(
      '/organizations/acme/settings/custom-property',
    )
  })

  it('gets path for property derails page', () => {
    expect(
      customPropertyDetailsPath({pathPrefix: 'organizations', sourceName: 'acme', propertyName: 'environment'}),
    ).toEqual('/organizations/acme/settings/custom-property/environment')
  })

  it('correctly encodes', () => {
    expect(
      customPropertyDetailsPath({pathPrefix: 'organizations', sourceName: '笑容', propertyName: 'environment'}),
    ).toEqual('/organizations/%E7%AC%91%E5%AE%B9/settings/custom-property/environment')
  })
})

describe('checkPropertyUsagePath', () => {
  it('gets path for usages of a definition in an org', () => {
    expect(
      checkPropertyUsagePath({pathPrefix: 'organizations', sourceName: 'acme', propertyName: 'environment'}),
    ).toEqual('/organizations/acme/settings/custom-properties-usage/environment')
  })

  it('encodes special characters in org name', () => {
    expect(
      checkPropertyUsagePath({pathPrefix: 'organizations', sourceName: '你好你', propertyName: 'environment'}),
    ).toEqual('/organizations/%E4%BD%A0%E5%A5%BD%E4%BD%A0/settings/custom-properties-usage/environment')
  })
})

describe('repositoryPropertiesSettingsPath', () => {
  it('should return the correct path for given org and repo', () => {
    expect(repositoryPropertiesSettingsPath({org: 'acme', repo: 'smile'})).toEqual(
      `/acme/smile/settings/custom-properties`,
    )
  })

  it('encodes special characters in org and repo name', () => {
    expect(repositoryPropertiesSettingsPath({org: '你好你', repo: '笑容'})).toEqual(
      `/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/settings/custom-properties`,
    )
  })
})

describe('forkPath', () => {
  it('should return the correct path for given owner and repo', () => {
    expect(forkPath({owner: 'acme', repo: 'smile'})).toEqual(`/acme/smile/fork`)
  })

  it('encodes special characters in owner and repo name', () => {
    expect(forkPath({owner: '你好你', repo: '笑容'})).toEqual(`/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/fork`)
  })
})

describe('forksListPath', () => {
  it('should return the correct path for given owner and repo', () => {
    expect(forksListPath({owner: 'acme', repo: 'smile'})).toEqual(`/acme/smile/forks`)
  })

  it('encodes special characters in owner and repo name', () => {
    expect(forksListPath({owner: '你好你', repo: '笑容'})).toEqual(
      `/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/forks`,
    )
  })
})

describe('newRepoPath', () => {
  it('should return correct path for given org', () => {
    expect(newRepoPath({org: 'acme'})).toEqual(`/organizations/acme/repositories/new`)
  })

  it('encodes special characters in owner and repo name', () => {
    expect(newRepoPath({org: '你好你'})).toEqual(`/organizations/%E4%BD%A0%E5%A5%BD%E4%BD%A0/repositories/new`)
  })

  it('should return correct path without org', () => {
    expect(newRepoPath({org: undefined})).toEqual(`/new`)
  })
})

describe('orgReposIndexPath', () => {
  it('should return correct path for a given org', () => {
    expect(orgReposIndexPath({org: 'acme'})).toEqual(`/orgs/acme/repositories`)
  })

  it('encodes special characters in owner name', () => {
    expect(orgReposIndexPath({org: '你好你'})).toEqual(`/orgs/%E4%BD%A0%E5%A5%BD%E4%BD%A0/repositories`)
  })
})

describe('actionsWorkflowRunPath', () => {
  test('returns corrent path when no param', async () => {
    expect(
      actionsWorkflowRunPath({
        owner: 'mona',
        repo: 'smile',
      }),
    ).toEqual('/mona/smile/actions')
  })

  test('encodes special characters when no param', async () => {
    expect(
      actionsWorkflowRunPath({
        owner: '你好你',
        repo: '笑容',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/actions')
  })

  test('includes runId', async () => {
    expect(
      actionsWorkflowRunPath({
        owner: 'mona',
        repo: 'smile',
        runId: '123',
      }),
    ).toEqual('/mona/smile/actions/runs/123')
  })

  test('includes runid and attempt', async () => {
    expect(
      actionsWorkflowRunPath({
        owner: 'mona',
        repo: 'smile',
        runId: '123',
        attempt: '2',
      }),
    ).toEqual('/mona/smile/actions/runs/123/attempts/2')
  })
})

describe('actionsWorkflowFilePath', () => {
  test('returns corrent path when no param', async () => {
    expect(
      actionsWorkflowFilePath({
        owner: 'mona',
        repo: 'smile',
      }),
    ).toEqual('/mona/smile/actions')
  })

  test('encodes special characters when no param', async () => {
    expect(
      actionsWorkflowFilePath({
        owner: '你好你',
        repo: '笑容',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/actions')
  })

  test('includes runId', async () => {
    expect(
      actionsWorkflowFilePath({
        owner: 'mona',
        repo: 'smile',
        runId: '123',
      }),
    ).toEqual('/mona/smile/actions/runs/123/workflow')
  })
})

describe('repoAttestationsIndexPath', () => {
  test('returns corrent path', async () => {
    expect(
      repoAttestationsIndexPath({
        repo: {ownerLogin: 'mona', name: 'smile'},
      }),
    ).toEqual('/mona/smile/attestations')
  })

  test('encodes special characters', async () => {
    expect(
      repoAttestationsIndexPath({
        repo: {ownerLogin: '你好你', name: '笑容'},
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/attestations')
  })
})

describe('repoAttestationShowPath', () => {
  test('returns corrent path', async () => {
    expect(
      repoAttestationShowPath({
        repo: {ownerLogin: 'mona', name: 'smile'},
        attestationId: '99',
      }),
    ).toEqual('/mona/smile/attestations/99')
  })

  test('encodes special characters', async () => {
    expect(
      repoAttestationShowPath({
        repo: {ownerLogin: '你好你', name: '笑容'},
        attestationId: '99',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/attestations/99')
  })
})

describe('repoAttestationDownloadPath', () => {
  test('returns corrent path', async () => {
    expect(
      repoAttestationDownloadPath({
        repo: {ownerLogin: 'mona', name: 'smile'},
        attestationId: '99',
      }),
    ).toEqual('/mona/smile/attestations/99/download')
  })

  test('encodes special characters', async () => {
    expect(
      repoAttestationDownloadPath({
        repo: {ownerLogin: '你好你', name: '笑容'},
        attestationId: '99',
      }),
    ).toEqual('/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/attestations/99/download')
  })
})

describe('enterprisePath', () => {
  test('returns enterprise path with slug', async () => {
    expect(enterprisePath({slug: 'some-test-slug'})).toEqual('/enterprises/some-test-slug')
  })
})

describe('fullUrl', () => {
  test('returns full URL given a path', async () => {
    expect(
      fullUrl({
        path: 'some-test-path',
      }),
    ).toEqual('http://localhost/some-test-path')
  })

  test('returns full URL given a path with leading slash', async () => {
    expect(
      fullUrl({
        path: '/some-test-path',
      }),
    ).toEqual('http://localhost/some-test-path')
  })

  test('returns full URL given a path with leading dot slash', async () => {
    expect(
      fullUrl({
        path: './some-test-path',
      }),
    ).toEqual('http://localhost/some-test-path')
  })
})

describe('orgRulesetsTargetCountPath', () => {
  it('should correctly encode a simple owner name', () => {
    const expectedPath = '/organizations/simpleName/settings/rules/deferred_target_counts'
    expect(orgRulesetsTargetCountPath({owner: 'simpleName'})).toEqual(expectedPath)
  })

  it('should correctly encode a complex owner name', () => {
    const expectedPath = '/organizations/%E4%BD%A0%E5%A5%BD%E4%BD%A0/settings/rules/deferred_target_counts'
    expect(orgRulesetsTargetCountPath({owner: '你好你'})).toEqual(expectedPath)
  })
})

describe('stafftoolsOrgRulesetsTargetCountPath', () => {
  it('should correctly encode a simple owner name', () => {
    const expectedPath = '/stafftools/users/simpleName/organization_rules/deferred_target_counts'
    expect(stafftoolsOrgRulesetsTargetCountPath({owner: 'simpleName'})).toEqual(expectedPath)
  })

  it('should correctly encode a complex owner name', () => {
    const expectedPath = '/stafftools/users/%E4%BD%A0%E5%A5%BD%E4%BD%A0/organization_rules/deferred_target_counts'
    expect(stafftoolsOrgRulesetsTargetCountPath({owner: '你好你'})).toEqual(expectedPath)
  })
})

describe('repoRulesetsTargetCountPath', () => {
  it('should correctly encode a simple owner name', () => {
    const expectedPath = '/monalisa/smile/settings/rules/deferred_target_counts'
    expect(repoRulesetsTargetCountPath({owner: 'monalisa', repo: 'smile'})).toEqual(expectedPath)
  })

  it('should correctly encode a complex owner name', () => {
    const expectedPath = '/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/settings/rules/deferred_target_counts'
    expect(repoRulesetsTargetCountPath({owner: '你好你', repo: '笑容'})).toEqual(expectedPath)
  })
})

describe('stafftoolRepoRulesetsTargetCountPath', () => {
  it('should correctly encode a simple owner name', () => {
    const expectedPath = '/stafftools/repositories/monalisa/smile/repository_rules/deferred_target_counts'
    expect(stafftoolsRepoRulesetsTargetCountPath({owner: 'monalisa', repo: 'smile'})).toEqual(expectedPath)
  })

  it('should correctly encode a complex owner name', () => {
    const expectedPath =
      '/stafftools/repositories/%E4%BD%A0%E5%A5%BD%E4%BD%A0/%E7%AC%91%E5%AE%B9/repository_rules/deferred_target_counts'
    expect(stafftoolsRepoRulesetsTargetCountPath({owner: '你好你', repo: '笑容'})).toEqual(expectedPath)
  })
})

describe('orgRepositoriesPath', () => {
  it('should return the correct path for a repo query', () => {
    expect(orgRepositoriesPath({owner: 'monalisa', query: 'props.database:mysql'})).toEqual(
      '/orgs/monalisa/repositories?q=props.database%3Amysql',
    )
    expect(orgRepositoriesPath({owner: 'monalisa', query: '-props.database:mysql'})).toEqual(
      '/orgs/monalisa/repositories?q=-props.database%3Amysql',
    )
    expect(orgRepositoriesPath({owner: 'monalisa', query: 'props.database:"dim grey",blue,"carbon black"'})).toEqual(
      '/orgs/monalisa/repositories?q=props.database%3A%22dim%20grey%22%2Cblue%2C%22carbon%20black%22',
    )
  })

  it('should return the correct path when enconding', () => {
    expect(orgRepositoriesPath({owner: '你好你', query: 'props.database:mysql'})).toEqual(
      '/orgs/%E4%BD%A0%E5%A5%BD%E4%BD%A0/repositories?q=props.database%3Amysql',
    )
    expect(orgRepositoriesPath({owner: '你好你', query: '-props.database:mysql'})).toEqual(
      '/orgs/%E4%BD%A0%E5%A5%BD%E4%BD%A0/repositories?q=-props.database%3Amysql',
    )
    expect(orgRepositoriesPath({owner: '你好你', query: 'props.database:"dim grey",blue,"carbon black"'})).toEqual(
      '/orgs/%E4%BD%A0%E5%A5%BD%E4%BD%A0/repositories?q=props.database%3A%22dim%20grey%22%2Cblue%2C%22carbon%20black%22',
    )
  })
})
