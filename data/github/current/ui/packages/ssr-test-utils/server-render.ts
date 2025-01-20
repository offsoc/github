import {clientEnvForTests} from '@github-ui/client-env'
import {type AppRenderRequest, handleRequest, type PartialRenderRequest} from '@github-ui/react-core/alloy-handler'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
type optionalParams = 'colorModes' | 'url' | 'clientEnv'
type Args = Optional<AppRenderRequest, optionalParams> | Optional<PartialRenderRequest, optionalParams>

/**
 * `serverRenderApp` renders a react app _similarly_ to how it would be rendered by Alloy. It is not intended to test
 * every behavior of every component, but rather to execute common code paths in a way that will catch code that is
 * not compatible with the node environment where Alloy executes.
 *
 * If you use this, you should include a @jest-environment override at the top of your file so that it executes in a
 * node environment instead of jsdom:
 *
 *    `/** @jest-environment node` (but with closing the block comment)
 *
 * Note that Jest may suggest "Consider using the "jsdom" test environment.". In the case of this kind of test, you
 * should ignore that suggestion.
 *
 * Some of the issues that this test will NOT catch include:
 *
 * - Failures due to the way Alloy uses a node VM for isolation
 * - Failures due to different build configurations between Jest and Alloy (e.g., different shims)
 * - Failures due to code paths not executing with the provided RenderRequest
 *
 * @returns A string of HTML. This is not a full HTML document, but rather the HTML that would be rendered by Alloy
 *   and placed inside a rails-rendered layout.
 */
export async function serverRenderReact({
  colorModes = {
    lightTheme: 'light',
    darkTheme: 'dark',
  },
  clientEnv = clientEnvForTests,
  ...rest
}: Args): Promise<string> {
  return handleRequest({
    clientEnv,
    colorModes,
    url: 'path' in rest ? `http://example.invalid${rest.path}` : 'http://example.invalid/unknown',
    ...rest,
  })
}
