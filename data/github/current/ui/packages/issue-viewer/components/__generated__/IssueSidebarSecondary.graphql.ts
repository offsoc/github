/**
 * @generated SignedSource<<8cb08c3a52c3937d261c3aafd0407c40>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueSidebarSecondary$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AssigneesSectionLazyFragment" | "OptionsSectionSecondary">;
  readonly " $fragmentType": "IssueSidebarSecondary";
};
export type IssueSidebarSecondary$key = {
  readonly " $data"?: IssueSidebarSecondary$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSidebarSecondary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSidebarSecondary",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "OptionsSectionSecondary"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AssigneesSectionLazyFragment"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "8fc24bb52effd976666af3d674ce0d7d";

export default node;
