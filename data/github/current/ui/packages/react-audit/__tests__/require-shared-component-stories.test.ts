import {getSharedComponents} from '../utils'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const trimPath = (fullPath: string) => {
  return fullPath.slice(fullPath.indexOf('ui/packages/'))
}

describe('Shared components have stories', () => {
  const {paths, missingStoriesComponentPaths} = getSharedComponents()

  const missingStories: {[key: string]: boolean} = {}
  for (const componentFullPath of missingStoriesComponentPaths) {
    const componentPath = trimPath(componentFullPath)
    missingStories[componentPath] = true
  }

  const backfillList = yaml.load(
    fs.readFileSync(path.join(__dirname, '../data/shared-component-stories-backfill.yml'), 'utf8'),
  ) as {[key: string]: string[]}

  const backfilled: string[] = []
  for (const componentPath of backfillList['missing_stories']!) {
    if (missingStories[componentPath]) {
      missingStories[componentPath] = false
    } else {
      backfilled.push(componentPath)
    }
  }

  const trimmedComponentPaths = paths.map(componentPath => trimPath(componentPath))
  test.each(trimmedComponentPaths)(
    'Component `%s` must have a story or be added to the backfill list',
    componentPath => {
      expect(missingStories[componentPath]).toBeFalsy()
    },
  )

  test('Components with stories do not appear on the backfill list', () => {
    expect(backfilled).toEqual([])
  })
})
