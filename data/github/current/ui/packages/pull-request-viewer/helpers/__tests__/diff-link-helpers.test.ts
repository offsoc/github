import type {PatchLinkProps, PullRequestLinkProps} from '../diff-link-helpers'
import {diffBlobBranchPath, diffBlobPath} from '../diff-link-helpers'

const patch: PatchLinkProps = {
  oid: 'f533ecde13U005d6c8f0e783b57a61fa5c2a72a9',
  path: 'README.md',
  status: 'ADDED',
}

const pullRequest: PullRequestLinkProps = {
  headRepositoryNameWithOwner: 'monalisa/headrepo',
  baseRepositoryNameWithOwner: 'monalisa/baserepo',
  headRefName: 'myBranch',
}

describe('diffBlobBranchPath', () => {
  test('handles the edit action', () => {
    const branchPath = diffBlobBranchPath('edit', patch, pullRequest)

    expect(branchPath).toBe('/monalisa/headrepo/edit/myBranch/README.md')
  })

  test('handles the delete action', () => {
    const branchPath = diffBlobBranchPath('delete', patch, pullRequest)

    expect(branchPath).toBe('/monalisa/headrepo/delete/myBranch/README.md')
  })

  test('handles undefined head repo name', () => {
    const branchPath = diffBlobBranchPath('edit', patch, {...pullRequest, ...{headRepositoryNameWithOwner: undefined}})

    expect(branchPath).toBe('')
  })

  test('handles a deleted patch status', () => {
    const branchPath = diffBlobBranchPath('edit', {...patch, ...{status: 'DELETED'}}, pullRequest)

    expect(branchPath).toBe('/monalisa/baserepo/blob/f533ecde13U005d6c8f0e783b57a61fa5c2a72a9/README.md')
  })
})

describe('diffBlobPath', () => {
  test('handles a non-deleted patch status', () => {
    const blobPath = diffBlobPath(patch, pullRequest)

    expect(blobPath).toBe('/monalisa/headrepo/blob/f533ecde13U005d6c8f0e783b57a61fa5c2a72a9/README.md')
  })

  test('handles a deleted patch status', () => {
    const blobPath = diffBlobPath({...patch, ...{status: 'DELETED'}}, pullRequest)

    expect(blobPath).toBe('/monalisa/baserepo/blob/f533ecde13U005d6c8f0e783b57a61fa5c2a72a9/README.md')
  })

  test('handles missing base repo name', () => {
    const blobPath = diffBlobPath(
      {...patch, ...{status: 'DELETED'}},
      {...pullRequest, ...{baseRepositoryNameWithOwner: undefined}},
    )

    expect(blobPath).toBe('')
  })

  test('handles missing head repo name', () => {
    const blobPath = diffBlobPath(patch, {...pullRequest, ...{headRepositoryNameWithOwner: undefined}})

    expect(blobPath).toBe('')
  })
})
