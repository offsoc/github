/**
 * @generated SignedSource<<d4e8785b3a9c9340dcaf185a48d7aa55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Description_pullRequest$data = {
  readonly body: string;
  readonly bodyHTML: string;
  readonly bodyVersion: string;
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly locked: boolean;
  readonly repository: {
    readonly databaseId: number | null | undefined;
    readonly id: string;
    readonly nameWithOwner: string;
    readonly slashCommandsEnabled: boolean;
  };
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeader" | "IssueBodyViewer" | "IssueBodyViewerReactable">;
  readonly " $fragmentType": "Description_pullRequest";
};
export type Description_pullRequest$key = {
  readonly " $data"?: Description_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"Description_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Description_pullRequest",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bodyVersion",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyHeader"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nameWithOwner",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slashCommandsEnabled",
          "storageKey": null
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUpdate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "locked",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "unfurlReferences",
          "value": true
        }
      ],
      "kind": "ScalarField",
      "name": "bodyHTML",
      "storageKey": "bodyHTML(unfurlReferences:true)"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyViewerReactable"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyViewer"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "fbbd43c776aa8b39c649f2d51e05124f";

export default node;
