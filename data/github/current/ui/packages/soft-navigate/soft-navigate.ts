import {startSoftNav} from '@github-ui/soft-nav/state'
import {visit} from '@github/turbo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function softNavigate(url: string, turboOptions?: any) {
  // visit won't fire a `turbo:click` event, so we need to manually start the soft navigation process.
  startSoftNav('turbo')
  visit(url, {...turboOptions})
}
