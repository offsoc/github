/**
 * @jest-environment node
 */
import {messages, plugin} from '../scss-to-css-border.mjs'
import {testRule} from './lib/helpers'
import type {AcceptTest, RejectTest} from './lib/helpers'
import type {Config} from 'stylelint'

const config: Config = {
  plugins: [plugin],
  customSyntax: 'postcss-scss',
  fix: true,
  rules: {
    'codemod/scss-to-css-border': true,
  },
}

const accept: AcceptTest[] = [
  {
    code: `.x {
      border: solid var(--borderWidth-thin) var(--borderColor-default);
      border-radius: var(--borderRadius-small);
    }`,
    description: 'Accepts CSS variables as they are correctly formatted.',
  },
]

const reject: RejectTest[] = [
  {
    code: `.x {
      border: $border-width $border-style var(--borderColor-attention-emphasis);
      border-radius: $border-radius;
    }`,
    fixed: `.x {
      border: var(--borderWidth-thin) solid var(--borderColor-attention-emphasis);
      border-radius: var(--borderRadius-medium);
    }`,
    description: 'Rejects SCSS variables that should be replaced with CSS variables.',
    warnings: [
      {
        column: 15,
        endColumn: 28,
        line: 2,
        message: messages.rejected('$border-width', 'var(--borderWidth-thin)'),
      },
      {
        column: 29,
        endColumn: 42,
        line: 2,
        message: messages.rejected('$border-style', 'solid'),
      },
      {
        column: 22,
        endColumn: 36,
        line: 3,
        message: messages.rejected('$border-radius', 'var(--borderRadius-medium)'),
      },
    ],
  },
  {
    code: `.x {
      border-top: $border-width*4 $border-style var(--borderColor-accent-emphasis);
    }`,
    fixed: `.x {
      border-top: $border-width*4 $border-style var(--borderColor-accent-emphasis);
    }`,
    description: "Doesn't replace SCSS variables with math.",
    warnings: [
      {
        column: 19,
        endColumn: 34,
        line: 2,
        message: messages.rejected('$border-width*4'),
      },
      {
        column: 35,
        endColumn: 48,
        line: 2,
        message: messages.rejected('$border-style'),
      },
    ],
  },
  {
    code: `.x {
      border-width: $border-width * 3;
      border-radius: $border-radius;
    }`,
    fixed: `.x {
      border-width: $border-width * 3;
      border-radius: var(--borderRadius-medium);
    }`,
    description: "Doesn't replace SCSS variables with math.",
    warnings: [
      {
        column: 21,
        endColumn: 34,
        line: 2,
        message: messages.rejected('$border-width'),
      },
      {
        column: 22,
        endColumn: 36,
        line: 3,
        message: messages.rejected('$border-radius', 'var(--borderRadius-medium)'),
      },
    ],
  },
  {
    code: `.x {
      border-radius: $border-radius $border-radius-1 $border-radius-2 $border-radius-3;
    }`,
    fixed: `.x {
      border-radius: var(--borderRadius-medium) var(--borderRadius-small) var(--borderRadius-medium) var(--borderRadius-medium);
    }`,
    description: 'Replaces correct scss variable when varible name is substring of another variable.',
    warnings: [
      {
        column: 22,
        endColumn: 36,
        line: 2,
        message: messages.rejected('$border-radius', 'var(--borderRadius-medium)'),
      },
      {
        column: 37,
        endColumn: 53,
        line: 2,
        message: messages.rejected('$border-radius-1', 'var(--borderRadius-small)'),
      },
      {
        column: 54,
        endColumn: 70,
        line: 2,
        message: messages.rejected('$border-radius-2', 'var(--borderRadius-medium)'),
      },
      {
        column: 71,
        endColumn: 87,
        line: 2,
        message: messages.rejected('$border-radius-3', 'var(--borderRadius-medium)'),
      },
    ],
  },
]

testRule({accept, reject, config})
