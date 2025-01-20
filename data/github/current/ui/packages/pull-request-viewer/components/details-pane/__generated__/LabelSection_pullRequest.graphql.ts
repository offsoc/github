/**
 * @generated SignedSource<<dbb2406b32cb2094b27d4e206fb4ca9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LabelSection_pullRequest$data = {
  readonly id: string;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"LabelPickerAssignedLabels">;
  readonly " $fragmentType": "LabelSection_pullRequest";
};
export type LabelSection_pullRequest$key = {
  readonly " $data"?: LabelSection_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"LabelSection_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LabelSection_pullRequest",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "LabelPickerAssignedLabels"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUpdate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "423aeb363b9b247a29eeced843468f0e";

export default node;
