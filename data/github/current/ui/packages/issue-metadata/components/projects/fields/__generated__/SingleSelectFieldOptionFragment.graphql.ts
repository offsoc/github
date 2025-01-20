/**
 * @generated SignedSource<<e2b2d72207081362c7cf19748078bb9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type ProjectV2SingleSelectFieldOptionColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SingleSelectFieldOptionFragment$data = {
  readonly color: ProjectV2SingleSelectFieldOptionColor;
  readonly descriptionHTML: string;
  readonly id: string;
  readonly name: string;
  readonly nameHTML: string;
  readonly optionId: string;
  readonly " $fragmentType": "SingleSelectFieldOptionFragment";
};
export type SingleSelectFieldOptionFragment$key = {
  readonly " $data"?: SingleSelectFieldOptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldOptionFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "SingleSelectFieldOptionFragment"
};

(node as any).hash = "be640a30fa15271b4fa34e75d3ddb9b1";

export default node;
