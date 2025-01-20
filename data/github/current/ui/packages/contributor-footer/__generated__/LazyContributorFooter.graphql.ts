/**
 * @generated SignedSource<<7fbc91557494c1d8f0479ec92cef0d2e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LazyContributorFooter$data = {
  readonly codeOfConductFileUrl: string | null | undefined;
  readonly contributingFileUrl: string | null | undefined;
  readonly securityPolicyUrl: string | null | undefined;
  readonly " $fragmentType": "LazyContributorFooter";
};
export type LazyContributorFooter$key = {
  readonly " $data"?: LazyContributorFooter$data;
  readonly " $fragmentSpreads": FragmentRefs<"LazyContributorFooter">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LazyContributorFooter",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "codeOfConductFileUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "securityPolicyUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "contributingFileUrl",
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "d2a8c9eedc89aef8966e7d5129eb31ce";

export default node;
