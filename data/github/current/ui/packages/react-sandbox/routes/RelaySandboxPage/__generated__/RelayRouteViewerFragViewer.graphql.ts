/**
 * @generated SignedSource<<7274dd15e842f016aa9176d3ed3d5e0d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RelayRouteViewerFragViewer$data = {
  readonly viewer: {
    readonly login: string;
  };
  readonly " $fragmentType": "RelayRouteViewerFragViewer";
};
export type RelayRouteViewerFragViewer$key = {
  readonly " $data"?: RelayRouteViewerFragViewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"RelayRouteViewerFragViewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayRouteViewerFragViewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "viewer",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "485847935afa23c6a8a13f2e200065b7";

export default node;
