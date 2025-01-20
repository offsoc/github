/**
 * @generated SignedSource<<279c6fa9875a664b464788012827bf97>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type NotificationThreadSubscriptionState = "LIST_IGNORED" | "LIST_SUBSCRIBED" | "THREAD_SUBSCRIBED" | "THREAD_TYPE_SUBSCRIBED" | "UNSUBSCRIBED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type InboxHeader_notification$data = {
  readonly id: string;
  readonly isUnread: boolean;
  readonly subject: {
    readonly __typename: "Commit";
    readonly id: string;
  } | {
    readonly __typename: "Discussion";
    readonly id: string;
  } | {
    readonly __typename: "Issue";
    readonly id: string;
  } | {
    readonly __typename: "PullRequest";
    readonly id: string;
  } | {
    readonly __typename: "TeamDiscussion";
    readonly id: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  };
  readonly subscriptionStatus: NotificationThreadSubscriptionState;
  readonly url: string;
  readonly " $fragmentType": "InboxHeader_notification";
};
export type InboxHeader_notification$key = {
  readonly " $data"?: InboxHeader_notification$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxHeader_notification">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InboxHeader_notification",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isUnread",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "subscriptionStatus",
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
      "name": "subject",
      "plural": false,
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
          "selections": (v1/*: any*/),
          "type": "Issue",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v1/*: any*/),
          "type": "Commit",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v1/*: any*/),
          "type": "PullRequest",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v1/*: any*/),
          "type": "Discussion",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v1/*: any*/),
          "type": "TeamDiscussion",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationThread",
  "abstractKey": null
};
})();

(node as any).hash = "0ee3104fc0fb07b17666fb7067051355";

export default node;
