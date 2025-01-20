/**
 * @generated SignedSource<<0fe109a37b8ff1b207966626365ddb7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueSubIssues_SandboxFragment$data = {
  readonly id: string;
  readonly subIssues: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"IssueSubIssues_InnerFragment">;
    } | null | undefined> | null | undefined;
  };
  readonly subIssuesSummary: {
    readonly completed: number;
    readonly percentCompleted: number;
    readonly total: number;
  };
  readonly " $fragmentType": "IssueSubIssues_SandboxFragment";
};
export type IssueSubIssues_SandboxFragment$key = {
  readonly " $data"?: IssueSubIssues_SandboxFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSubIssues_SandboxFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSubIssues_SandboxFragment",
  "selections": [
    (v0/*: any*/),
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
          "selections": [
            (v0/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "IssueSubIssues_InnerFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "subIssues(first:50)"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SubIssuesSummary",
      "kind": "LinkedField",
      "name": "subIssuesSummary",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "total",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "completed",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "percentCompleted",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "def437f62ac51161c4bb3f06c0f32caa";

export default node;
