/**
 * @generated SignedSource<<768923b3940fef716332f0cd76cebf49>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentViewerCommentRow$data = {
  readonly author: {
    readonly __typename: string;
    readonly avatarUrl: string;
    readonly login: string;
  } | null | undefined;
  readonly body: string;
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly isHidden: boolean;
  readonly issue: {
    readonly id: string;
    readonly locked: boolean;
  };
  readonly pendingMinimizeReason: string | null | undefined;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentHeader" | "IssueCommentViewerMarkdownViewer">;
  readonly " $fragmentType": "IssueCommentViewerCommentRow";
};
export type IssueCommentViewerCommentRow$key = {
  readonly " $data"?: IssueCommentViewerCommentRow$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentViewerCommentRow">;
};

const node: ReaderFragment = (function(){
var v0 = {
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
  "name": "IssueCommentViewerCommentRow",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentViewerMarkdownViewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentHeader"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "avatarUrl",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "issue",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "locked",
          "storageKey": null
        }
      ],
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
      "alias": "isHidden",
      "args": null,
      "kind": "ScalarField",
      "name": "isMinimized",
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
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "pendingMinimizeReason",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "IssueComment",
  "abstractKey": null
};
})();

(node as any).hash = "4115af1dd0ae4ebb85035229b2bc2eca";

export default node;
