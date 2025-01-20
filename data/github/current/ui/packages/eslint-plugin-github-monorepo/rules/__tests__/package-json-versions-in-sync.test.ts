import rule from '../package-json-versions-in-sync'

const fsMock = jest.fn()
jest.mock('fs', () => ({
  readFileSync: (path: string) => fsMock(path),
}))

const mockRuleInvoke = () => {
  const mockContext = {
    report: jest.fn(),
  }
  const caller = rule.create(mockContext).Property

  return {
    context: mockContext,
    call: caller,
  }
}

it('ignores non Literal properties', () => {
  const mockNode = {
    value: {
      type: 'ObjectExpression',
    },
  }
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(fsMock).toHaveBeenCalledTimes(0)
  expect(context.report).toHaveBeenCalledTimes(0)
})

it('ignores wildcard (*) version usages', () => {
  const mockNode = {
    value: {
      type: 'Literal',
      value: '*',
    },
  }
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(fsMock).toHaveBeenCalledTimes(0)
  expect(context.report).toHaveBeenCalledTimes(0)
})

it('ignores irrelevant dependencies', () => {
  const mockNode = {
    key: {
      value: 'react',
    },
    value: {
      type: 'Literal',
      value: '14.1.0',
    },
  }
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(fsMock).toHaveBeenCalledTimes(0)
  expect(context.report).toHaveBeenCalledTimes(0)
})

it('ignores enforced packages with missing enforced dependencies declared', () => {
  const mockNode = {
    key: {
      value: 'relay-compiler',
    },
    value: {
      type: 'Literal',
      value: '14.1.0',
    },
  }
  fsMock.mockReturnValueOnce(`{
    "dependencies": {
      "react": "1"
    }
  }`)
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(fsMock).toHaveBeenCalledTimes(2)
  expect(fsMock).toHaveBeenNthCalledWith(1, expect.stringContaining('/relay-build/package.json'))
  expect(fsMock).toHaveBeenNthCalledWith(2, expect.stringContaining('/relay-environment/package.json'))
  expect(context.report).toHaveBeenCalledTimes(0)
})

it('ignores packages with matching dependencies', () => {
  const mockNode = {
    key: {
      value: 'relay-compiler',
    },
    value: {
      type: 'Literal',
      value: '14.1.0',
    },
  }
  fsMock.mockReturnValueOnce(`{
    "dependencies": {
      "relay-compiler": "14.1.0"
    }
  }`)
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(context.report).toHaveBeenCalledTimes(0)
})

it('reports error for same dependency version mismatches', () => {
  const mockNode = {
    key: {
      value: 'relay-compiler',
    },
    value: {
      type: 'Literal',
      value: '15.0.0',
    },
  }
  fsMock.mockReturnValueOnce(`{
    "name": "@github-ui/relay-build",
    "dependencies": {
      "relay-compiler": "14.1.0"
    }
  }`)
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(context.report).toHaveBeenCalledTimes(1)
  expect(context.report).toHaveBeenCalledWith(
    expect.objectContaining({
      message:
        'This package has a dependency on relay-compiler@15.0.0, which differs from the relay-compiler@14.1.0 version used in the @github-ui/relay-build package. These version numbers must be in sync. ',
    }),
  )
})

it('reports error for different depency version mismatches', () => {
  const mockNode = {
    key: {
      value: 'relay-runtime',
    },
    value: {
      type: 'Literal',
      value: '15.0.0',
    },
  }
  fsMock.mockReturnValueOnce(`{
    "name": "@github-ui/relay-build",
    "dependencies": {
      "relay-compiler": "14.1.0"
    }
  }`)
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(context.report).toHaveBeenCalledTimes(1)
  expect(context.report).toHaveBeenCalledWith(
    expect.objectContaining({
      message:
        'This package has a dependency on relay-runtime@15.0.0, which differs from the relay-compiler@14.1.0 version used in the @github-ui/relay-build package. These version numbers must be in sync. ',
    }),
  )
})

it('reports errors for multiple mismatches', () => {
  const mockNode = {
    key: {
      value: 'relay-runtime',
    },
    value: {
      type: 'Literal',
      value: '15.0.0',
    },
  }
  fsMock.mockReturnValueOnce(`{
    "name": "@github-ui/relay-build",
    "dependencies": {
      "relay-compiler": "14.1.0"
    }
  }`).mockReturnValueOnce(`{
    "name": "@github-ui/relay-environment",
    "dependencies": {
      "relay-runtime": "14.1.0"
    }
  }`)
  const {context, call} = mockRuleInvoke()

  call(mockNode)

  expect(context.report).toHaveBeenCalledTimes(2)
  expect(context.report).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      message:
        'This package has a dependency on relay-runtime@15.0.0, which differs from the relay-compiler@14.1.0 version used in the @github-ui/relay-build package. These version numbers must be in sync. ',
    }),
  )
  expect(context.report).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      message:
        'This package has a dependency on relay-runtime@15.0.0, which differs from the relay-runtime@14.1.0 version used in the @github-ui/relay-environment package. These version numbers must be in sync. ',
    }),
  )
})
