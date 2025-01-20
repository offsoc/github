import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {within, screen, waitFor, type ByRoleMatcher, type ByRoleOptions} from '@testing-library/react'

export function mockFetchJSON<T>(response: T, config?: {ok: boolean; status?: number}) {
  const {ok = true, status = 200} = config ?? {}
  const mockFetch = verifiedFetchJSON as jest.Mock
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve(response),
      ok,
      status,
    }),
  )
}

export const wait = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 1))

export type RoleQuery = [ByRoleMatcher, ByRoleOptions?]

type ViewParent = ReturnType<typeof within> | typeof screen | null

export class View {
  static get<T extends typeof View>(this: T, parent?: ViewParent): InstanceType<T> {
    const self = new this(parent) as InstanceType<T>

    return self
  }

  static async getLazy<T extends typeof View>(this: T) {
    try {
      return new this({
        container: await waitFor(async () => {
          try {
            // Access the query property directly on the class
            return await screen.findByRole.apply(this, this.prototype.query)
          } catch (e) {
            return undefined
          }
        }),
      }) as InstanceType<T>
    } catch (e) {
      return new this({container: undefined}) as InstanceType<T>
    }
  }

  query: unknown extends [infer Matcher, ...infer RestElement]
    ? Matcher extends ByRoleMatcher
      ? Matcher
      : RoleQuery
    : RoleQuery = [''] // this is to keep typescript happy. query is a property that exists only to be overriden
  container: HTMLElement | null
  parent: ViewParent

  constructor({parent}: {parent?: ViewParent; container?: HTMLElement | null} = {}) {
    this.container = null
    this.parent = parent ?? parent instanceof HTMLElement ? within(parent) : screen
  }

  get h() {
    return this.container
  }

  get findChild() {
    return this.container ? within(this.container) : screen
  }
}
