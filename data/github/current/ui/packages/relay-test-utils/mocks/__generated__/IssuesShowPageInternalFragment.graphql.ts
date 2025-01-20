/**
 * @generated SignedSource<<eb90e32f425069d3c0e8e2b53a8ca2b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuesShowPageInternalFragment$data = {
  readonly " $fragmentSpreads": FragmentRefs<"ViewerIssuesShowPageInternalFragment">;
  readonly " $fragmentType": "IssuesShowPageInternalFragment";
};
export type IssuesShowPageInternalFragment$key = {
  readonly " $data"?: IssuesShowPageInternalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssuesShowPageInternalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "number"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssuesShowPageInternalFragment",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "number",
          "variableName": "number"
        }
      ],
      "kind": "FragmentSpread",
      "name": "ViewerIssuesShowPageInternalFragment"
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "121c0350d3a61e5d94b971d4b1f0baf2";

export default node;
