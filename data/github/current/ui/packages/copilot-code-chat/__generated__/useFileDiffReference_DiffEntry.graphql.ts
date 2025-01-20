/**
 * @generated SignedSource<<a32e260b0ef457460b648d2a46274c20>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useFileDiffReference_DiffEntry$data = {
  readonly isBinary: boolean;
  readonly isLfsPointer: boolean;
  readonly isSubmodule: boolean;
  readonly newTreeEntry: {
    readonly path: string | null | undefined;
    readonly size: number;
  } | null | undefined;
  readonly oldTreeEntry: {
    readonly path: string | null | undefined;
    readonly size: number;
  } | null | undefined;
  readonly path: string;
  readonly pathDigest: string;
  readonly rawUrl: string | null | undefined;
  readonly " $fragmentType": "useFileDiffReference_DiffEntry";
};
export type useFileDiffReference_DiffEntry$key = {
  readonly " $data"?: useFileDiffReference_DiffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_DiffEntry">;
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
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "size",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFileDiffReference_DiffEntry",
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
      "kind": "ScalarField",
      "name": "rawUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isBinary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isSubmodule",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isLfsPointer",
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
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};
})();

(node as any).hash = "f853615ae640634aad832da060f944cf";

export default node;
