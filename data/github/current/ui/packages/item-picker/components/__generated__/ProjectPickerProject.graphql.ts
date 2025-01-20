/**
 * @generated SignedSource<<47a0f9fdfe54eb68fe3d2189e40c0e07>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectPickerProject$data = {
  readonly __typename: "ProjectV2";
  readonly closed: boolean;
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly url: string;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentType": "ProjectPickerProject";
};
export type ProjectPickerProject$key = {
  readonly " $data"?: ProjectPickerProject$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ProjectPickerProject"
};

(node as any).hash = "22b448002723db428ab2fc77629a67ad";

export default node;
