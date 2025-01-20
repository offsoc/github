/**
 * @generated SignedSource<<205bb17c49d95b2ae4eb35360fd05bee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getItemsBlockLabel$data = {
  readonly color: string;
  readonly description: string | null;
  readonly id: string;
  readonly name: string;
  readonly nameHTML: string;
  readonly " $fragmentType": "getItemsBlockLabel";
};
export type getItemsBlockLabel$key = {
  readonly " $data"?: getItemsBlockLabel$data;
  readonly " $fragmentSpreads": FragmentRefs<"getItemsBlockLabel">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getItemsBlockLabel"
};

(node as any).hash = "d460327bddf0d09c65b845fffcef7820";

export default node;
