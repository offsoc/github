/**
 * @generated SignedSource<<1d147ebc45d908427dad0cc6b3ba35b2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type ThreadSubscriptionFormAction = "NONE" | "SUBSCRIBE" | "UNSUBSCRIBE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SubscriptionSectionFragment$data = {
  readonly id: string;
  readonly viewerThreadSubscriptionFormAction: ThreadSubscriptionFormAction | null | undefined;
  readonly " $fragmentType": "SubscriptionSectionFragment";
};
export type SubscriptionSectionFragment$key = {
  readonly " $data"?: SubscriptionSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubscriptionSectionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubscriptionSectionFragment",
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
      "name": "viewerThreadSubscriptionFormAction",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "5631a4213ee621e782a16780ed45a521";

export default node;
