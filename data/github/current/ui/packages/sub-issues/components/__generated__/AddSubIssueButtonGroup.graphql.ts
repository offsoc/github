/**
 * @generated SignedSource<<d82a47f0e403f4f86057c42026d8ba5e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AddSubIssueButtonGroup$data = {
  readonly id: string;
  readonly parent: {
    readonly id: string;
  } | null | undefined;
  readonly repository: {
    readonly nameWithOwner: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly subIssues?: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "AddSubIssueButtonGroup";
};
export type AddSubIssueButtonGroup$key = {
  readonly " $data"?: AddSubIssueButtonGroup$data;
  readonly " $fragmentSpreads": FragmentRefs<"AddSubIssueButtonGroup">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "fetchSubIssues"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "AddSubIssueButtonGroup",
  "selections": [
    (v0/*: any*/),
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
          "name": "nameWithOwner",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
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
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "parent",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "condition": "fetchSubIssues",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 50
            }
          ],
          "concreteType": "IssueConnection",
          "kind": "LinkedField",
          "name": "subIssues",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Issue",
              "kind": "LinkedField",
              "name": "nodes",
              "plural": true,
              "selections": (v1/*: any*/),
              "storageKey": null
            }
          ],
          "storageKey": "subIssues(first:50)"
        }
      ]
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "91b09ec83ddc81ecb75d2a78eae7296c";

export default node;
