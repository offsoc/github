import type {DirectoryNode, SummaryDelta} from '../diff-file-tree-helpers'
import {getFileTree} from '../diff-file-tree-helpers'

it('should construct a basic file tree', () => {
  const a_b_c_d = generateDiff('a/b/c/d.js')
  const a_b_other_a = generateDiff('a/b/other/a.js')
  const c = generateDiff('c.js')

  const tree = getFileTree([a_b_c_d, a_b_other_a, c])
  verifyTree(tree, {
    directories: [
      {
        name: 'a',
        directories: [
          {
            name: 'b',
            directories: [
              {
                name: 'c',
                files: [a_b_c_d],
              },
              {
                name: 'other',
                files: [a_b_other_a],
              },
            ],
          },
        ],
      },
    ],
    files: [c],
  })
})

it('should sort the file tree', () => {
  const a_b_c_a = generateDiff('a/b/c/a.js')
  const a_b_c_b = generateDiff('a/b/c/b.js')
  const a_b_c_d_c = generateDiff('a/b/c/d/c.js')
  const a_b_c_d_d = generateDiff('a/b/c/d/d.js')
  const b_a_a_a = generateDiff('b/a/a/a.js')
  const b_a_a_b = generateDiff('b/a/a/b.js')
  const a = generateDiff('a')
  const r = generateDiff('r.rb')
  const z = generateDiff('z.zed')

  // Passing in diffs in intentionally random order, which should require sorting
  const tree = getFileTree([b_a_a_a, a_b_c_a, z, a_b_c_b, a, a_b_c_d_d, r, b_a_a_b, a_b_c_d_c])
  verifyTree(tree, {
    directories: [
      {
        name: 'a',
        directories: [
          {
            name: 'b',
            directories: [
              {
                name: 'c',
                directories: [
                  {
                    name: 'd',
                    files: [a_b_c_d_c, a_b_c_d_d],
                  },
                ],
                files: [a_b_c_a, a_b_c_b],
              },
            ],
          },
        ],
      },
      {
        name: 'b',
        directories: [
          {
            name: 'a',
            directories: [
              {
                name: 'a',
                files: [b_a_a_a, b_a_a_b],
              },
            ],
          },
        ],
      },
    ],
    files: [a, r, z],
  })
})

interface ExpectedDirectory {
  name?: string
  directories?: ExpectedDirectory[]
  files?: SummaryDelta[]
}
function verifyTree(tree: DirectoryNode<SummaryDelta>, expectedTree: ExpectedDirectory, leadingPath = '') {
  const {name, directories, files} = expectedTree

  if (name) {
    expect(leadingPath + tree.name).toBe(leadingPath + name)
  }

  if (directories) {
    expect(tree.directories.map(d => leadingPath + d.name).join(',')).toEqual(
      directories.map(d => leadingPath + (d.name || '')).join(','),
    )

    // Traverse through the directories on both sides to verify that they match
    for (let i = 0; i < directories.length; i++) {
      verifyTree(tree.directories[i]!, directories[i]!, `${leadingPath + tree.name}/`)
    }
  } else {
    expect(tree.directories.map(d => leadingPath + d.name).join(',')).toEqual('')
  }

  if (files) {
    expect(tree.files.map(file => file.fileName)).toEqual(files.map(f => f.path.split('/').pop()))
    expect(tree.files.map(file => file.diff)).toEqual(files)
  }
}

function generateDiff(path: string): SummaryDelta {
  return {
    path,
    pathDigest: 'test-digest',
  }
}
