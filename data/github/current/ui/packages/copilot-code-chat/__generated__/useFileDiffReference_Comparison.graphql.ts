/**
 * @generated SignedSource<<c34f1ed45ae3cb39eb54094e580e3055>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useFileDiffReference_Comparison$data = {
  readonly newCommit: {
    readonly oid: any;
    readonly repository: {
      readonly databaseId: number | null | undefined;
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
      readonly url: string;
    };
  };
  readonly oldCommit: {
    readonly oid: any;
    readonly repository: {
      readonly databaseId: number | null | undefined;
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
      readonly url: string;
    };
  };
  readonly " $fragmentType": "useFileDiffReference_Comparison";
};
export type useFileDiffReference_Comparison$key = {
  readonly " $data"?: useFileDiffReference_Comparison$data;
  readonly " $fragmentSpreads": FragmentRefs<"useFileDiffReference_Comparison">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "oid",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "repository",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "databaseId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "url",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "owner",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "login",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFileDiffReference_Comparison",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "oldCommit",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "newCommit",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "PullRequestComparison",
  "abstractKey": null
};
})();

(node as any).hash = "fb70959c69497160ff44b9b0c7820e08";

export default node;
