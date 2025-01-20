import type {Meta} from '@storybook/react'
import {type SafeHTMLString, SafeHTMLBox, SafeHTMLText, SafeHTMLDiv} from './SafeHTML'

const safeHTMLString =
  "This string has a <b>bold tag</b> and a <a class='Link--inTextBlock' href='https://github.com'>link</a> in it. It has been marked as safe." as SafeHTMLString

const unsafeHTMLString =
  "This string has a <b>bold tag</b> and a <a class='Link--inTextBlock' href='https://github.com'>link</a> in it. But has not been marked as safe."

const meta = {
  title: 'Utilities/SafeHTML',
} satisfies Meta

export default meta

export const Box = () => <SafeHTMLBox html={safeHTMLString} />

export const Text = () => <SafeHTMLText as="pre" html={safeHTMLString} />

export const Div = () => <SafeHTMLDiv html={safeHTMLString} />

export const UnsafeBox = () => <SafeHTMLBox unverifiedHTML={unsafeHTMLString} />

export const UnsafeText = () => <SafeHTMLText as="pre" unverifiedHTML={unsafeHTMLString} />

export const UnsafeDiv = () => <SafeHTMLDiv unverifiedHTML={unsafeHTMLString} />
