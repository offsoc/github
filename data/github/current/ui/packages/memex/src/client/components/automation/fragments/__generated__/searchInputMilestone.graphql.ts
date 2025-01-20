/**
 * @generated SignedSource<<208a00493da0766ecd870701b22f474a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type searchInputMilestone$data = {
  readonly closed: boolean;
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "searchInputMilestone";
};
export type searchInputMilestone$key = {
  readonly " $data"?: searchInputMilestone$data;
  readonly " $fragmentSpreads": FragmentRefs<"searchInputMilestone">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "searchInputMilestone"
};

(node as any).hash = "25725c8585936addfbf60c431dd10621";

export default node;
