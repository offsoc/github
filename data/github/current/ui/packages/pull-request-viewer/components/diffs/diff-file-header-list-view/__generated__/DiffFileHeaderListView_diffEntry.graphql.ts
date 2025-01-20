/**
 * @generated SignedSource<<063413f9c9a33fced5824534b3c65e8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DiffFileHeaderListView_diffEntry$data = {
  readonly linesAdded: number;
  readonly linesDeleted: number;
  readonly newTreeEntry: {
    readonly mode: number;
    readonly path: string | null | undefined;
  } | null | undefined;
  readonly oldTreeEntry: {
    readonly mode: number;
    readonly path: string | null | undefined;
  } | null | undefined;
  readonly path: string;
  readonly pathDigest: string;
  readonly pathOwnership: {
    readonly " $fragmentSpreads": FragmentRefs<"CodeownersBadge_pathOwnership">;
  };
  readonly status: PatchStatus;
  readonly " $fragmentSpreads": FragmentRefs<"BlobActionsMenu_diffEntry" | "FileConversationsButton_diffEntry" | "ViewedCheckbox_diffEntry">;
  readonly " $fragmentType": "DiffFileHeaderListView_diffEntry";
};
export type DiffFileHeaderListView_diffEntry$key = {
  readonly " $data"?: DiffFileHeaderListView_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_diffEntry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "mode",
    "storageKey": null
  },
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DiffFileHeaderListView_diffEntry",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pathDigest",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "PathOwnership",
      "kind": "LinkedField",
      "name": "pathOwnership",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "CodeownersBadge_pathOwnership"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TreeEntry",
      "kind": "LinkedField",
      "name": "oldTreeEntry",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TreeEntry",
      "kind": "LinkedField",
      "name": "newTreeEntry",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "linesAdded",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "linesDeleted",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BlobActionsMenu_diffEntry"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FileConversationsButton_diffEntry"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ViewedCheckbox_diffEntry"
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};
})();

(node as any).hash = "1c54c1f0b4631da4489b090b2d1ba3da";

export default node;
