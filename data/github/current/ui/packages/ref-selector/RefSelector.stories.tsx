import type {Meta} from '@storybook/react'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {RefSelector, type RefSelectorProps} from './RefSelector'

type Refs = 'tag' | 'branch'

const owner = 'owner'
const repo = 'repo'
const refs = {
  tag: ['0.0.1', '0.1.1', '1.1.1'],
  branch: ['main', 'test', 'my-branch'],
} as const

const args = {
  cacheKey: 'cacheKey',
  canCreate: true,
  currentCommitish: 'currentCommitish',
  defaultBranch: 'main',
  owner,
  repo,
} satisfies RefSelectorProps

const meta = {
  title: 'Utilities/RefSelector',
  component: RefSelector,
} satisfies Meta<typeof RefSelector>

export default meta

export const Example = {
  args,
  parameters: {
    msw: {
      handlers: [
        http.get(`/${owner}/${repo}/refs`, ({request}) => {
          const type = (new URL(request.url, window.location.origin).searchParams.get('type') as Refs) ?? 'branch'
          return HttpResponse.json({refs: refs[type], cacheKey: type})
        }),
      ],
    },
  },
}

export const LoadingError = {
  args,
  parameters: {
    msw: {
      handlers: [http.get(`/${owner}/${repo}/refs`, () => new Response(null, {status: 404}))],
    },
  },
}
