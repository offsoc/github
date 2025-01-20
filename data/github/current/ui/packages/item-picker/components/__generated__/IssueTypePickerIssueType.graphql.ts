/**
 * @generated SignedSource<<f33b2c9363c9bcaa56a4060fe0853424>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueTypePickerIssueType$data = {
  readonly color: IssueTypeColor;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly isEnabled: boolean;
  readonly name: string;
  readonly " $fragmentType": "IssueTypePickerIssueType";
};
export type IssueTypePickerIssueType$key = {
  readonly " $data"?: IssueTypePickerIssueType$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypePickerIssueType">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "IssueTypePickerIssueType"
};

(node as any).hash = "0c223d6af5ad63c9b9e4b8a624f01688";

export default node;
