/**
 * @generated SignedSource<<46ceef174abc3b614e8ec7699e91864a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IterationFieldFragment$data = {
  readonly duration: number;
  readonly field: {
    readonly " $fragmentSpreads": FragmentRefs<"IterationFieldConfigFragment">;
  };
  readonly iterationId: string;
  readonly startDate: any;
  readonly title: string;
  readonly titleHTML: string;
  readonly " $fragmentType": "IterationFieldFragment";
};
export type IterationFieldFragment$key = {
  readonly " $data"?: IterationFieldFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IterationFieldFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IterationFieldFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "iterationId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "titleHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startDate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "duration",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "field",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IterationFieldConfigFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectV2ItemFieldIterationValue",
  "abstractKey": null
};

(node as any).hash = "a1fed908ae0caadc70b43a8c0032cf90";

export default node;
