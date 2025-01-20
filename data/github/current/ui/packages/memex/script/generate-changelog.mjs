// @ts-check
/* eslint no-console: "off" */

import fetch from 'node-fetch'

const REPO_OWNER = 'github'
const REPO_NAME = 'memex'

const [, , token, tagName] = process.argv
if (!token || !tagName) {
  console.info('Usage: node script/generate-changelog <token> <tag name>')
  process.exit(1)
}

;(async function () {
  const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/generate-notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      tag_name: tagName,
    }),
  })

  if (!response.ok) {
    console.error(`API request failed: "${response.status}: ${response.statusText}"`)
    process.exit(2)
  }

  const {body} = await response.json().catch(() => ({}))
  if (!body) {
    console.error("Invalid API response (must be JSON containing a 'body' property)")
    process.exit(3)
  }

  console.log(body)
  process.exit(0) // it's important that we don't log anything else after this point, since we use the raw output of this script as the changelog
})()
