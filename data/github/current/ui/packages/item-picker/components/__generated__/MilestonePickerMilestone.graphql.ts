/**
 * @generated SignedSource<<157726faf93d0fb2d44ee8e553541b2c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MilestonePickerMilestone$data = {
  readonly closed: boolean;
  readonly closedAt: string | null | undefined;
  readonly dueOn: string | null | undefined;
  readonly id: string;
  readonly progressPercentage: number;
  readonly title: string;
  readonly url: string;
  readonly " $fragmentType": "MilestonePickerMilestone";
};
export type MilestonePickerMilestone$key = {
  readonly " $data"?: MilestonePickerMilestone$data;
  readonly " $fragmentSpreads": FragmentRefs<"MilestonePickerMilestone">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "MilestonePickerMilestone"
};

(node as any).hash = "94cec103731033abe0392685ad560834";

export default node;
