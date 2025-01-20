/**
 * @generated SignedSource<<533a1c03fee898230c1048d93d498ed7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SingleSelectColumn$data = {
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "SingleSelectColumn";
};
export type SingleSelectColumn$key = {
  readonly " $data"?: SingleSelectColumn$data;
  readonly " $fragmentSpreads": FragmentRefs<"SingleSelectColumn">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "SingleSelectColumn"
};

(node as any).hash = "8b1de10eb126973dfa5c3073ee40da66";

export default node;
