/**
 * @generated SignedSource<<bad2398eeb004a468e340709bfed542e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CodeownersBadge_pathOwnership$data = {
  readonly isOwnedByViewer: boolean;
  readonly pathOwners: ReadonlyArray<{
    readonly name: string;
  }>;
  readonly ruleLineNumber: number | null | undefined;
  readonly ruleUrl: string | null | undefined;
  readonly " $fragmentType": "CodeownersBadge_pathOwnership";
};
export type CodeownersBadge_pathOwnership$key = {
  readonly " $data"?: CodeownersBadge_pathOwnership$data;
  readonly " $fragmentSpreads": FragmentRefs<"CodeownersBadge_pathOwnership">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CodeownersBadge_pathOwnership",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PathOwner",
      "kind": "LinkedField",
      "name": "pathOwners",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ruleLineNumber",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ruleUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isOwnedByViewer",
      "storageKey": null
    }
  ],
  "type": "PathOwnership",
  "abstractKey": null
};

(node as any).hash = "913e8bf5e84366a28f664a98feb2bc16";

export default node;
