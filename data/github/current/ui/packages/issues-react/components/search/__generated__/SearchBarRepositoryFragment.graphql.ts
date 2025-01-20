/**
 * @generated SignedSource<<03392bd0c8e61e3368986a46489c648a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchBarRepositoryFragment$data = {
  readonly isOwnerEnterpriseManaged: boolean | null | undefined;
  readonly " $fragmentType": "SearchBarRepositoryFragment";
};
export type SearchBarRepositoryFragment$key = {
  readonly " $data"?: SearchBarRepositoryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SearchBarRepositoryFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SearchBarRepositoryFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isOwnerEnterpriseManaged",
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "b728e92edb142e5b9e3a33c061046fb0";

export default node;
