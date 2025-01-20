/**
 * @generated SignedSource<<19a9beb1fc73a39722116554facbddff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CrossReferencedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly innerSource: {
    readonly __typename: string;
    readonly " $fragmentSpreads": FragmentRefs<"CrossReferencedEventInner">;
  };
  readonly referencedAt: string;
  readonly target: {
    readonly repository?: {
      readonly id: string;
    };
  };
  readonly willCloseTarget: boolean;
  readonly " $fragmentType": "CrossReferencedEvent";
};
export type CrossReferencedEvent$key = {
  readonly " $data"?: CrossReferencedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"CrossReferencedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CrossReferencedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "referencedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "willCloseTarget",
      "storageKey": null
    },
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "target",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "Issue",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": "innerSource",
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "source",
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "CrossReferencedEventInner"
        }
      ],
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
    }
  ],
  "type": "CrossReferencedEvent",
  "abstractKey": null
};

(node as any).hash = "1d279941c7c26f380423f387e31fd6d3";

export default node;
