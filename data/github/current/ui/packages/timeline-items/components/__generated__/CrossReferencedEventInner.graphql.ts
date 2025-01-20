/**
 * @generated SignedSource<<9ecaa64bc786c5e9636dfa1f95bb9675>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type CrossReferencedEventInner$data = {
  readonly __typename: "Issue";
  readonly id: string;
  readonly issueTitleHTML: string;
  readonly number: number;
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly stateReason: IssueStateReason | null | undefined;
  readonly url: string;
  readonly " $fragmentType": "CrossReferencedEventInner";
} | {
  readonly __typename: "PullRequest";
  readonly id: string;
  readonly isDraft: boolean;
  readonly isInMergeQueue: boolean;
  readonly number: number;
  readonly pullTitleHTML: string;
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly state: PullRequestState;
  readonly url: string;
  readonly " $fragmentType": "CrossReferencedEventInner";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "CrossReferencedEventInner";
};
export type CrossReferencedEventInner$key = {
  readonly " $data"?: CrossReferencedEventInner$data;
  readonly " $fragmentSpreads": FragmentRefs<"CrossReferencedEventInner">;
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
  "name": "url",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v3 = {
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CrossReferencedEventInner",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "issueTitleHTML",
          "args": null,
          "kind": "ScalarField",
          "name": "titleHTML",
          "storageKey": null
        },
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "stateReason",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "pullTitleHTML",
          "args": null,
          "kind": "ScalarField",
          "name": "titleHTML",
          "storageKey": null
        },
        (v1/*: any*/),
        (v2/*: any*/),
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
          "name": "isDraft",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isInMergeQueue",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "ReferencedSubject",
  "abstractKey": "__isReferencedSubject"
};
})();

(node as any).hash = "196207cdab8669b7f68d65f4a0888f91";

export default node;
