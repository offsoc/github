/**
 * @generated SignedSource<<a4fa0e138fe1844e87d61740d68b9e59>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IterationFieldIterationFragment$data = {
  readonly duration: number;
  readonly id: string;
  readonly startDate: any;
  readonly title: string;
  readonly titleHTML: string;
  readonly " $fragmentType": "IterationFieldIterationFragment";
};
export type IterationFieldIterationFragment$key = {
  readonly " $data"?: IterationFieldIterationFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IterationFieldIterationFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "IterationFieldIterationFragment"
};

(node as any).hash = "28591c2749a30e9b111acd7e77a057f9";

export default node;
