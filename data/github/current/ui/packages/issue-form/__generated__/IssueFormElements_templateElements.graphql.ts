/**
 * @generated SignedSource<<34c87f1f91799e78b080f1c0ab33bbdf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueFormElements_templateElements$data = {
  readonly elements: ReadonlyArray<{
    readonly __typename: "IssueFormElementCheckboxes";
    readonly " $fragmentSpreads": FragmentRefs<"CheckboxesElement_input">;
  } | {
    readonly __typename: "IssueFormElementDropdown";
    readonly " $fragmentSpreads": FragmentRefs<"DropdownElement_input">;
  } | {
    readonly __typename: "IssueFormElementInput";
    readonly " $fragmentSpreads": FragmentRefs<"TextInputElement_input">;
  } | {
    readonly __typename: "IssueFormElementMarkdown";
    readonly " $fragmentSpreads": FragmentRefs<"MarkdownElement_input">;
  } | {
    readonly __typename: "IssueFormElementTextarea";
    readonly " $fragmentSpreads": FragmentRefs<"TextAreaElement_input">;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  }>;
  readonly " $fragmentType": "IssueFormElements_templateElements";
};
export type IssueFormElements_templateElements$key = {
  readonly " $data"?: IssueFormElements_templateElements$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueFormElements_templateElements">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "IssueFormElements_templateElements"
};

(node as any).hash = "ede4ed0621414b21a6281552d5ac0ffe";

export default node;
