/**
 * @generated SignedSource<<b3d64d75b9736508904394d6f40e6e85>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ReactionsMenuItem_Reaction$data = {
  readonly content: ReactionContent;
  readonly viewerHasReacted: boolean;
  readonly " $fragmentType": "ReactionsMenuItem_Reaction";
};
export type ReactionsMenuItem_Reaction$key = {
  readonly " $data"?: ReactionsMenuItem_Reaction$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReactionsMenuItem_Reaction">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactionsMenuItem_Reaction",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "content",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerHasReacted",
      "storageKey": null
    }
  ],
  "type": "ReactionGroup",
  "abstractKey": null
};

(node as any).hash = "20f6c2f6e4d048844423d4fac2bf978a";

export default node;
