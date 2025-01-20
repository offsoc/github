/**
 * @jest-environment node
 */
import {messages, plugin} from '../scss-to-css-spacing.mjs'
import {testRule} from './lib/helpers'
import type {AcceptTest, RejectTest} from './lib/helpers'
import type {Config} from 'stylelint'

const config: Config = {
  plugins: [plugin],
  customSyntax: 'postcss-scss',
  fix: true,
  rules: {
    'codemod/scss-to-css-spacing': true,
  },
}

const accept: AcceptTest[] = [
  {
    code: '.x { padding: var(--base-size-4); }',
    description: 'Accepts CSS variables as they are correctly formatted.',
  },
  {
    code: `.x {
      // stylelint-disable-next-line primer/colors
      background: lighten($static-color-blue-000, 1%);
    }`,
    description: 'Accepts SCSS variables that are not spacing variables.',
  },
]

const reject: RejectTest[] = [
  {
    code: '.x { padding: $spacer-1; }',
    fixed: '.x { padding: var(--base-size-4); }',
    description: 'Rejects SCSS variables that should be replaced with CSS variables.',
    warnings: [
      {
        message: messages.rejected('$spacer-1', 'var(--base-size-4)'),
        line: 1,
        column: 15,
        endColumn: 24,
      },
    ],
  },
  {
    code: '.x { padding: rem($spacer-9); }',
    unfixable: true,
    description: 'Rejects but does not fix SCSS variables that are in rem functions.',
    warnings: [
      {
        message: messages.rejected('$spacer-9', 'var(--base-size-80)'),
        line: 1,
        column: 19,
        endColumn: 28,
      },
    ],
  },
  {
    code: '.x { padding: 0 $spacer-1 $spacer-1 $spacer-1; }',
    fixed: '.x { padding: 0 var(--base-size-4) var(--base-size-4) var(--base-size-4); }',
    description: 'Rejects SCSS variables that should be replaced with CSS variables.',
    warnings: [
      {
        message: messages.rejected('$spacer-1', 'var(--base-size-4)'),
        line: 1,
        column: 17,
        endColumn: 26,
      },
      {
        message: messages.rejected('$spacer-1', 'var(--base-size-4)'),
        line: 1,
        column: 27,
        endColumn: 36,
      },
      {
        message: messages.rejected('$spacer-1', 'var(--base-size-4)'),
        line: 1,
        column: 37,
        endColumn: 46,
      },
    ],
  },
  {
    code: '.x { padding: -$spacer-1; }',
    fixed: '.x { padding: calc(var(--base-size-4) * -1); }',
    description: 'Rejects Negative SCSS variables.',
    warnings: [
      {
        message: messages.rejected('-$spacer-1', 'calc(var(--base-size-4) * -1)'),
        line: 1,
        column: 15,
        endColumn: 25,
      },
    ],
  },
  {
    code: '.x { padding: $spacer-1 * 2; }',
    unfixable: true,
    description: 'Rejects SCSS variables that are mathed.',
    warnings: [
      {
        message: messages.rejected('$spacer-1', 'var(--base-size-4)'),
        line: 1,
        column: 15,
        endColumn: 24,
      },
    ],
  },
  {
    code: '.x { left: $spacer-6 + $spacer-5; }',
    unfixable: true,
    description: 'Rejects SCSS variables that are mathed.',
    warnings: [
      {
        message: messages.rejected('$spacer-6', 'var(--base-size-40)'),
        line: 1,
        column: 12,
        endColumn: 21,
      },
      {
        message: messages.rejected('$spacer-5', 'var(--base-size-32)'),
        line: 1,
        column: 24,
        endColumn: 33,
      },
    ],
  },
]

testRule({accept, reject, config})
