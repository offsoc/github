/* eslint eslint-comments/no-use: off */
/* eslint-disable github/unescaped-html-literal */

import type {Meta, StoryObj} from '@storybook/react'

import type {SafeHTMLString} from '@github-ui/safe-html'
import {Snippet} from './Snippet'
import {fileContext} from './context'

const meta = {
  title: 'Code/Snippet',
  component: Snippet,
  decorators: [
    Story => {
      return (
        <fileContext.Provider
          value={{
            fileUrl: '/zed-industries/font-kit/blob/main/src/canvas.ts',
            repoUrl: 'zed-industries/font-kit',
          }}
        >
          {Story()}
        </fileContext.Provider>
      )
    },
  ],
} satisfies Meta<typeof Snippet>

export default meta

export const Default = {
  args: {
    lines: [
      {
        html: '<span class=pl-c>// This function represents a function that calculates the days between days</span>' as SafeHTMLString,
        number: 1,
      },
      {
        html: '<span class=pl-k>function</span> <span class=pl-en>calculateDaysBetweenDates</span><span class=pl-kos>(</span><span class=pl-s1>begin</span><span class=pl-kos>,</span> <span class=pl-s1>end</span><span class=pl-kos>)</span> <span class=pl-kos>{</span>' as SafeHTMLString,
        number: 2,
      },
      {
        html: '    <span class=pl-k>var</span> <span class=pl-s1>oneDay</span> <span class=pl-c1>=</span> <span class=pl-c1>24</span><span class=pl-c1>*</span><span class=pl-c1>60</span><span class=pl-c1>*</span><span class=pl-c1>60</span><span class=pl-c1>*</span><span class=pl-c1>1000</span><span class=pl-kos>;</span> <span class=pl-c>// hours*minutes*seconds*milliseconds</span>' as SafeHTMLString,
        number: 3,
      },
      {
        html: '    <span class=pl-k>var</span> <span class=pl-s1>firstDate</span> <span class=pl-c1>=</span> <span class=pl-k>new</span> <span class=pl-v>Date</span><span class=pl-kos>(</span><span class=pl-s1>begin</span><span class=pl-kos>)</span><span class=pl-kos>;</span>' as SafeHTMLString,
        number: 4,
      },
      {
        html: '    <span class=pl-k>var</span> <span class=pl-s1>secondDate</span> <span class=pl-c1>=</span> <span class=pl-k>new</span> <span class=pl-v>Date</span><span class=pl-kos>(</span><span class=pl-s1>end</span><span class=pl-kos>)</span><span class=pl-kos>;</span>' as SafeHTMLString,
        number: 5,
      },
      {
        html: '<span class=pl-kos>}</span>' as SafeHTMLString,
        number: 6,
      },
    ],
  },
} satisfies StoryObj<typeof Snippet>
