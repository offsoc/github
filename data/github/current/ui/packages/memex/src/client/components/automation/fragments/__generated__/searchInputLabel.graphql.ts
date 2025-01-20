/**
 * @generated SignedSource<<f87fd3ac299238339c2751e1843f01b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type searchInputLabel$data = {
  readonly color: string;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly nameHTML: string;
  readonly " $fragmentType": "searchInputLabel";
};
export type searchInputLabel$key = {
  readonly " $data"?: searchInputLabel$data;
  readonly " $fragmentSpreads": FragmentRefs<"searchInputLabel">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "searchInputLabel"
};

(node as any).hash = "52a949cfd65641f7e70925d735bf135d";

export default node;
