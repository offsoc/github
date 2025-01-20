/**
 * @generated SignedSource<<92832a574fd606b966e5dabf5f85c7d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxRowContent_fragment$data = {
  readonly isUnread: boolean;
  readonly summaryItemAuthor: {
    readonly avatarUrl: string;
  } | null | undefined;
  readonly summaryItemBody: string | null | undefined;
  readonly " $fragmentType": "InboxRowContent_fragment";
};
export type InboxRowContent_fragment$key = {
  readonly " $data"?: InboxRowContent_fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxRowContent_fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InboxRowContent_fragment",
  "selections": [
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
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "summaryItemAuthor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "avatarUrl",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "summaryItemBody",
      "storageKey": null
    }
  ],
  "type": "NotificationThread",
  "abstractKey": null
};

(node as any).hash = "3f44f693e839822ff85dfb8b05a61999";

export default node;
