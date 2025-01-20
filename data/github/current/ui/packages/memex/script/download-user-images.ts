import {execSync} from 'child_process'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import {resolve} from 'path'

import {org, teams, users} from '../src/mocks/data/users-list'

/**
 *
 * @param {OwnerTypeWithId} ownerTypeWithId
 * @returns
 */
async function getImage(ownerTypeWithId: string) {
  /**
   * The url for github avatars is at this location, with a query parameter
   * that include `s={value}` for supplying an image size.
   */
  const url = `https://avatars.githubusercontent.com/${ownerTypeWithId}?s=48`
  try {
    const response = await fetch(url)
    if (response.ok) {
      const buffer = await response.buffer()
      const [type, id] = ownerTypeWithId.split('/')
      try {
        await fs.stat(resolve(`./dev-environment/assets/avatars/${type}`))
      } catch {
        await fs.mkdir(resolve(`./dev-environment/assets/avatars/${type}`))
      }
      return fs.writeFile(resolve(`./dev-environment/assets/avatars/${type}/${id}.png`), buffer)
    }
  } catch (e) {
    console.error(`Failed to download image ${ownerTypeWithId} from ${url}`, e)
  }
}

async function run() {
  execSync('rm -rf ./dev-environment/assets/avatars/**/*')

  const ids = new Set([...teams.map(t => `t/${t.id}`), ...users.map(u => `u/${u.id}`), `u/${org.id}`])

  console.log(`Start downloading images for ${ids.size} entities`)
  const promises = await Promise.allSettled([...ids.values()].map(ownerTypeWithId => getImage(ownerTypeWithId)))

  const successes = promises.filter(p => p.status === 'fulfilled')
  const errors = promises.filter(p => p.status === 'rejected')

  console.log(`Done downloading images. Successful downloads: ${successes.length}. Failed downloads: ${errors.length}`)
}

void run()
