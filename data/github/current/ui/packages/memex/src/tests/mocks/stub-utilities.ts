type JestFnStub<T extends (...args: any) => any> = [ReturnType<T>, Parameters<T>]
type JestMock<T extends (...args: any) => any> = jest.Mock<JestFnStub<T>[0], JestFnStub<T>[1]>

export function stubFnReturnValue<T extends (...args: any) => any>(returnValue: ReturnType<T>): JestMock<T> {
  return jest.fn<JestFnStub<T>[0], JestFnStub<T>[1]>().mockReturnValue(returnValue)
}

/**
 * Convert an imported hook into a mocked version for stubbing in test.
 *
 * This function assumes you've added the import above with a `jest.mock(path)`
 * call, otherwise this will error as the original function cannot be mocked
 * directly.
 */
export function asMockHook<THookResult>(func: (...args: Array<any>) => THookResult): jest.Mock<Partial<THookResult>> {
  return func as jest.Mock<THookResult>
}

/**
 * Convert a module function from Jest into the proper typed version.
 *
 * This function assumes the module has already been mocked with a `jest.mock(path)`
 * call within the test suite, otherwise Bad Things will happen at runtime for the tests.
 */
export function asMockFunction<TFunction extends (...args: any) => any>(
  fn: TFunction,
): jest.Mock<ReturnType<TFunction>, Parameters<TFunction>> {
  if (!jest.isMockFunction(fn)) {
    throw new Error(
      `The received function has not been mocked by Jest. Did you forget to add a 'jest.mock(path)' to this module's location?`,
    )
  }

  return fn as unknown as jest.Mock<ReturnType<TFunction>, Parameters<TFunction>>
}

/**
 * Convert an imported component into a mocked version for stubbing in test.
 *
 * This function assumes you've added the import above with a `jest.mock(path)`
 * call, otherwise this will error as the original function cannot be mocked
 * directly.
 */
export function asMockComponent<Props extends object>(func: (props: Props) => JSX.Element): jest.Mock {
  return func as jest.Mock
}
