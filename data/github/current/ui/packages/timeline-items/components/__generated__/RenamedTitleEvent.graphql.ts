/**
 * @generated SignedSource<<0d8388bf7f1c38ef43fcdcaa7451ef14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RenamedTitleEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly currentTitle: string;
  readonly databaseId: number | null | undefined;
  readonly previousTitle: string;
  readonly " $fragmentType": "RenamedTitleEvent";
};
export type RenamedTitleEvent$key = {
  readonly " $data"?: RenamedTitleEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"RenamedTitleEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RenamedTitleEvent",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "currentTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "previousTitle",
      "storageKey": null
    }
  ],
  "type": "RenamedTitleEvent",
  "abstractKey": null
};

(node as any).hash = "51c475b1e987f59acbc80c0754983081";

export default node;
