/**
 * @generated SignedSource<<e79a3a26db3f88ce25f1bc8429358401>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestFilesViewerContent_pullRequest$data = {
  readonly databaseId: number | null | undefined;
  readonly headRefOid: any;
  readonly id: string;
  readonly isInMergeQueue: boolean;
  readonly repository: {
    readonly databaseId: number | null | undefined;
    readonly id: string;
    readonly nameWithOwner: string;
    readonly slashCommandsEnabled: boolean;
  };
  readonly state: PullRequestState;
  readonly viewerCanApplySuggestion: boolean;
  readonly viewerCanComment: boolean;
  readonly viewerPendingReview: {
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"DiffsWithComments_pullRequest">;
  readonly " $fragmentType": "PullRequestFilesViewerContent_pullRequest";
};
export type PullRequestFilesViewerContent_pullRequest$key = {
  readonly " $data"?: PullRequestFilesViewerContent_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestFilesViewerContent_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PullRequestFilesViewerContent_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffsWithComments_pullRequest"
    },
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "headRefOid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestReview",
      "kind": "LinkedField",
      "name": "viewerPendingReview",
      "plural": false,
      "selections": [
        (v1/*: any*/)
      ],
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
        (v0/*: any*/),
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isInMergeQueue",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanComment",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanApplySuggestion",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "bef233f1d284f33321638483d1881901";

export default node;
