/**
 * @generated SignedSource<<a6df2e3b627a287c69cfceae36f4f008>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UnlabeledEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly label: {
    readonly " $fragmentSpreads": FragmentRefs<"LabelData">;
  };
  readonly " $fragmentType": "UnlabeledEvent";
};
export type UnlabeledEvent$key = {
  readonly " $data"?: UnlabeledEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"UnlabeledEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UnlabeledEvent",
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
      "concreteType": "Label",
      "kind": "LinkedField",
      "name": "label",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LabelData"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UnlabeledEvent",
  "abstractKey": null
};

(node as any).hash = "40e1e1df8c52602ee31a250f328424a0";

export default node;
