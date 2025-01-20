/**
 * @generated SignedSource<<4e3875ac5ac1c2eea5de8691065dd116>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentComposer$data = {
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly locked: boolean;
  readonly repository: {
    readonly databaseId: number | null | undefined;
    readonly id: string;
    readonly isArchived: boolean;
    readonly nameWithOwner: string;
    readonly viewerCanInteract: boolean;
    readonly viewerInteractionLimitReasonHTML: string | null | undefined;
  };
  readonly viewerCanComment: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"IssueActions">;
  readonly " $fragmentType": "IssueCommentComposer";
};
export type IssueCommentComposer$key = {
  readonly " $data"?: IssueCommentComposer$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentComposer">;
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
  "name": "IssueCommentComposer",
  "selections": [
    (v0/*: any*/),
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
    (v1/*: any*/),
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
          "name": "viewerCanInteract",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerInteractionLimitReasonHTML",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueActions"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "9618823da54ffd247d5aeb642a0298e9";

export default node;
