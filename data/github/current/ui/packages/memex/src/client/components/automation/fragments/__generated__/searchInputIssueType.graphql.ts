/**
 * @generated SignedSource<<7a941e7b738fd67fc6b42092e19cfc6a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type searchInputIssueType$data = {
  readonly id: string;
  readonly isEnabled: boolean;
  readonly name: string;
  readonly " $fragmentType": "searchInputIssueType";
};
export type searchInputIssueType$key = {
  readonly " $data"?: searchInputIssueType$data;
  readonly " $fragmentSpreads": FragmentRefs<"searchInputIssueType">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "searchInputIssueType"
};

(node as any).hash = "0e2c4c3c51227e87bbabb7dad24e212c";

export default node;
