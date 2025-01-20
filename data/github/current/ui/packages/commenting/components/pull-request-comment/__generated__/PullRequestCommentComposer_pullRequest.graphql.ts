/**
 * @generated SignedSource<<b84840b30b024ac9d66a17c49f408018>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type RepositoryVisibility = "INTERNAL" | "PRIVATE" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestCommentComposer_pullRequest$data = {
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly locked: boolean;
  readonly repository: {
    readonly codeOfConductFileUrl: string | null | undefined;
    readonly contributingFileUrl: string | null | undefined;
    readonly databaseId: number | null | undefined;
    readonly isArchived: boolean;
    readonly nameWithOwner: string;
    readonly securityPolicyUrl: string | null | undefined;
    readonly slashCommandsEnabled: boolean;
    readonly visibility: RepositoryVisibility;
  };
  readonly state: PullRequestState;
  readonly viewerCanClose: boolean;
  readonly viewerCanComment: boolean;
  readonly viewerCanReopen: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestCommentActionButtons_pullRequest">;
  readonly " $fragmentType": "PullRequestCommentComposer_pullRequest";
};
export type PullRequestCommentComposer_pullRequest$key = {
  readonly " $data"?: PullRequestCommentComposer_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestCommentComposer_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
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
  "name": "PullRequestCommentComposer_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
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
      "name": "viewerCanComment",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanClose",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanReopen",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isArchived",
          "storageKey": null
        },
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
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "securityPolicyUrl",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "contributingFileUrl",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "codeOfConductFileUrl",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "visibility",
          "storageKey": null
        }
      ],
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "PullRequestCommentActionButtons_pullRequest"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "e6d428cf46f0f4d1ed57dadb7486f5b6";

export default node;
