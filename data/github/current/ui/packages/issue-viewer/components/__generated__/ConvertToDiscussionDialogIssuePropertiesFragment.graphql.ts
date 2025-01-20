/**
 * @generated SignedSource<<7cdbf2f0268e6f2d0a5966dd6d2cabcc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ConvertToDiscussionDialogIssuePropertiesFragment$data = {
  readonly assignees: {
    readonly totalCount: number;
  };
  readonly comments: {
    readonly totalCount: number;
  };
  readonly milestone: {
    readonly __typename: "Milestone";
  } | null | undefined;
  readonly projectCards: {
    readonly totalCount: number;
  };
  readonly projectsV2: {
    readonly totalCount: number;
  };
  readonly reactions: {
    readonly totalCount: number;
  };
  readonly tasklistBlocks: {
    readonly totalCount: number;
  } | null | undefined;
  readonly " $fragmentType": "ConvertToDiscussionDialogIssuePropertiesFragment";
};
export type ConvertToDiscussionDialogIssuePropertiesFragment$key = {
  readonly " $data"?: ConvertToDiscussionDialogIssuePropertiesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConvertToDiscussionDialogIssuePropertiesFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "totalCount",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ConvertToDiscussionDialogIssuePropertiesFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueCommentConnection",
      "kind": "LinkedField",
      "name": "comments",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ReactionConnection",
      "kind": "LinkedField",
      "name": "reactions",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TasklistBlockConnection",
      "kind": "LinkedField",
      "name": "tasklistBlocks",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "assignees",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Connection",
      "kind": "LinkedField",
      "name": "projectsV2",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCardConnection",
      "kind": "LinkedField",
      "name": "projectCards",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Milestone",
      "kind": "LinkedField",
      "name": "milestone",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "cb39e70a3cd268ceaabb35294611ddd6";

export default node;
