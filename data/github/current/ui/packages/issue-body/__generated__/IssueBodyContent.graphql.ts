/**
 * @generated SignedSource<<c78516255379aae1a75a52e873df7b58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyContent$data = {
  readonly body: string;
  readonly bodyHTML: string;
  readonly bodyVersion: string;
  readonly " $fragmentType": "IssueBodyContent";
};
export type IssueBodyContent$key = {
  readonly " $data"?: IssueBodyContent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyContent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBodyContent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "renderTasklistBlocks",
          "value": true
        },
        {
          "kind": "Literal",
          "name": "unfurlReferences",
          "value": true
        }
      ],
      "kind": "ScalarField",
      "name": "bodyHTML",
      "storageKey": "bodyHTML(renderTasklistBlocks:true,unfurlReferences:true)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bodyVersion",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "aa4df7b9e6a8e7545c9fcfd9c3de151e";

export default node;
