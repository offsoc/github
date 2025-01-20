/**
 * @generated SignedSource<<ca82bec353f99200671eebc232602197>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueSubIssues_InnerFragment$data = {
  readonly assignees: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly avatarUrl: string;
        readonly id: string;
        readonly login: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
  readonly closedByPullRequestsReferences: {
    readonly totalCount: number;
  } | null | undefined;
  readonly id: string;
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly color: string;
      readonly id: string;
      readonly name: string;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly state: IssueState;
  readonly subIssuesSummary: {
    readonly completed: number;
    readonly percentCompleted: number;
    readonly total: number;
  };
  readonly title: string;
  readonly titleHTML: string;
  readonly url: string;
  readonly " $fragmentType": "IssueSubIssues_InnerFragment";
};
export type IssueSubIssues_InnerFragment$key = {
  readonly " $data"?: IssueSubIssues_InnerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSubIssues_InnerFragment">;
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
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSubIssues_InnerFragment",
  "selections": [
    (v0/*: any*/),
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
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v1/*: any*/),
      "concreteType": "LabelConnection",
      "kind": "LinkedField",
      "name": "labels",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Label",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "color",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "labels(first:10)"
    },
    {
      "alias": null,
      "args": (v1/*: any*/),
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "assignees",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "UserEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "login",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "avatarUrl",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "assignees(first:10)"
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
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 0
        },
        {
          "kind": "Literal",
          "name": "includeClosedPrs",
          "value": true
        }
      ],
      "concreteType": "PullRequestConnection",
      "kind": "LinkedField",
      "name": "closedByPullRequestsReferences",
      "plural": false,
      "selections": [
        (v2/*: any*/)
      ],
      "storageKey": "closedByPullRequestsReferences(first:0,includeClosedPrs:true)"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "7f6e7e686a0e987dd8591d497f25f48c";

export default node;
