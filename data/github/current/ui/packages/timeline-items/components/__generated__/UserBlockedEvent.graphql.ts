/**
 * @generated SignedSource<<ac9c0848a56c686b7917bc719e23e5db>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type UserBlockDuration = "ONE_DAY" | "ONE_MONTH" | "ONE_WEEK" | "PERMANENT" | "THREE_DAYS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type UserBlockedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly blockDuration: UserBlockDuration;
  readonly blockedUser: {
    readonly login: string;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "UserBlockedEvent";
};
export type UserBlockedEvent$key = {
  readonly " $data"?: UserBlockedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserBlockedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserBlockedEvent",
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
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "blockDuration",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": "blockedUser",
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "subject",
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
  "type": "UserBlockedEvent",
  "abstractKey": null
};

(node as any).hash = "6b9c2c6b2924af46270fda70b956f73d";

export default node;
