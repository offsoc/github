/**
 * @generated SignedSource<<fbdd814f8db245c73ac0491d20559d22>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesListViewViewer$data = {
  readonly isEmployee: boolean;
  readonly " $fragmentType": "SubIssuesListViewViewer";
};
export type SubIssuesListViewViewer$key = {
  readonly " $data"?: SubIssuesListViewViewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListViewViewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubIssuesListViewViewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEmployee",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "1aa936852ac406154dfb9323174dd7e7";

export default node;
