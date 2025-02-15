import {RuleTester} from '@typescript-eslint/rule-tester'

import path from 'node:path'
import rule, {components} from '../rules/unnecessary-components'

const prcImport = 'import React from "react"; import {Box, Text} from "@primer/react";'
const brandImport = 'import React from "react"; import {Box, Text} from "@primer/brand";'

const jsx = (content: string) => `export const Component = () => <>${content}</>`

const sxObjectDeclaration = `const props = {sx: {color: "red"}};`
const asObjectDeclaration = `const props = {as: "table"};`
const stringRecordDeclaration = `const props: Record<string, any> = {};`
const testIdObjectDeclaration = `const props = {'data-testid': 'xyz'};`
const componentDeclaration = `const OtherComponent = ({children}: {children: React.ReactNode}) => <>{children}</>;`
const asConstDeclaration = `const as = "p";`

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.resolve(__dirname, 'fixtures'),
    project: path.resolve(__dirname, 'fixtures', 'tsconfig.json'),
  },
  defaultFilenames: {
    ts: 'file.ts',
    tsx: 'File.tsx',
  },
})

jest.retryTimes(0, {logErrorsBeforeRetry: true})

const filename = 'File.tsx'

ruleTester.run('unnecessary-components', rule, {
  valid: [
    {name: 'Unrelated JSX', code: jsx('<span>Hello World</span>'), filename},
    ...Object.keys(components).flatMap(component => [
      {
        name: `Non-PRC ${component}`,
        code: `${brandImport}${jsx(`<${component}>Hello World</${component}>`)}`,
        filename,
      },
      {
        name: `${component} with sx prop`,
        code: `${prcImport}${jsx(`<${component} sx={{color: "red"}}>Hello World</${component}>`)}`,
        filename,
      },
      {
        name: `${component} with any styled-system prop`,
        code: `${prcImport}${jsx(`<${component} flex="row">Hello World</${component}>`)}`,
        filename,
      },
      {
        name: `${component} with spread sx prop`,
        code: `${prcImport}${sxObjectDeclaration}${jsx(`<${component} {...props}>Hello World</${component}>`)}`,
        filename,
      },
      {
        name: `${component} with string index spread props`,
        code: `${prcImport}${stringRecordDeclaration}${jsx(`<${component} {...props}>Hello World</${component}>`)}`,
        filename,
      },
    ]),
  ],
  invalid: Object.entries(components).flatMap(([component, {messageId, replacement}]) => [
    {
      name: `${component} without any styled-system props`,
      code: `${prcImport}${jsx(`<${component}>Hello World</${component}>`)}`,
      output: `${prcImport}${jsx(`<${replacement}>Hello World</${replacement}>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `Self-closing ${component} without any styled-system props`,
      code: `${prcImport}${jsx(`<${component} />`)}`,
      output: `${prcImport}${jsx(`<${replacement} />`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with spread props without sx`,
      code: `${prcImport}${testIdObjectDeclaration}${jsx(`<${component} {...props}>Hello World</${component}>`)}`,
      output: `${prcImport}${testIdObjectDeclaration}${jsx(`<${replacement} {...props}>Hello World</${replacement}>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with string element 'as' prop`,
      code: `${prcImport}${jsx(`<${component} as="code">Hello world</${component}>`)}`,
      // There is extra whitespace here we don't worry about since formatters would get rid of it
      output: `${prcImport}${jsx(`<code >Hello world</code>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with single-character 'as' prop`,
      code: `${prcImport}${jsx(`<${component} as="p">Hello world</${component}>`)}`,
      output: `${prcImport}${jsx(`<p >Hello world</p>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with string element 'as' prop surrounded by unnecessary braces`,
      code: `${prcImport}${jsx(`<${component} as={"code"}>Hello world</${component}>`)}`,
      output: `${prcImport}${jsx(`<code >Hello world</code>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with component reference 'as' prop`,
      code: `${prcImport}${componentDeclaration}${jsx(`<${component} as={OtherComponent}>Hello world</${component}>`)}`,
      output: `${prcImport}${componentDeclaration}${jsx(`<OtherComponent >Hello world</OtherComponent>`)}`,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with spread 'as' prop`,
      code: `${prcImport}${asObjectDeclaration}${jsx(`<${component} {...props}>Hello world</${component}>`)}`,
      output: null,
      errors: [{messageId}],
      filename,
    },
    {
      name: `${component} with unusable lowercase reference 'as' prop`,
      code: `${prcImport}${asConstDeclaration}${jsx(`<${component} as={as}>Hello world</${component}>`)}`,
      output: null,
      errors: [{messageId}],
      filename,
    },
  ]),
})
