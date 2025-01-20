/**
 * @generated SignedSource<<4cc5dbdfa77c4857e59acf3e611156d3>>
 * @relayHash 1ae7eaec5997fb568c52984e0ec88dc2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1ae7eaec5997fb568c52984e0ec88dc2

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerPullRequestsAndBranchesTestQuery$variables = {
  number: number;
  owner: string;
  repo: string;
};
export type ItemPickerPullRequestsAndBranchesTestQuery$data = {
  readonly repository: {
    readonly issue: {
      readonly linkedBranches: {
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranches_SelectedBranchesFragment">;
      };
      readonly linkedPullRequests: {
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type ItemPickerPullRequestsAndBranchesTestQuery = {
  response: ItemPickerPullRequestsAndBranchesTestQuery$data;
  variables: ItemPickerPullRequestsAndBranchesTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v4 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v5 = {
  "kind": "Literal",
  "name": "first",
  "value": 10
},
v6 = [
  (v5/*: any*/)
],
v7 = [
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "includeClosedPrs",
    "value": false
  },
  {
    "kind": "Literal",
    "name": "orderByState",
    "value": true
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemPickerPullRequestsAndBranchesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ItemPickerPullRequestsAndBranches_SelectedBranchesFragment"
                  }
                ],
                "storageKey": "linkedBranches(first:10)"
              },
              {
                "alias": "linkedPullRequests",
                "args": (v7/*: any*/),
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment"
                  }
                ],
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ItemPickerPullRequestsAndBranchesTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "LinkedBranch",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "ref",
                        "plural": false,
                        "selections": [
                          (v8/*: any*/),
                          (v9/*: any*/),
                          {
                            "alias": "title",
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:10)"
              },
              {
                "alias": "linkedPullRequests",
                "args": (v7/*: any*/),
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequest",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "title",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
              },
              (v9/*: any*/)
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1ae7eaec5997fb568c52984e0ec88dc2",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.id": (v10/*: any*/),
        "repository.issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.id": (v10/*: any*/),
        "repository.issue.linkedBranches": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "LinkedBranchConnection"
        },
        "repository.issue.linkedBranches.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "LinkedBranch"
        },
        "repository.issue.linkedBranches.nodes.id": (v10/*: any*/),
        "repository.issue.linkedBranches.nodes.ref": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Ref"
        },
        "repository.issue.linkedBranches.nodes.ref.__typename": (v11/*: any*/),
        "repository.issue.linkedBranches.nodes.ref.id": (v10/*: any*/),
        "repository.issue.linkedBranches.nodes.ref.title": (v11/*: any*/),
        "repository.issue.linkedPullRequests": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestConnection"
        },
        "repository.issue.linkedPullRequests.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequest"
        },
        "repository.issue.linkedPullRequests.nodes.__typename": (v11/*: any*/),
        "repository.issue.linkedPullRequests.nodes.id": (v10/*: any*/),
        "repository.issue.linkedPullRequests.nodes.title": (v11/*: any*/)
      }
    },
    "name": "ItemPickerPullRequestsAndBranchesTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "4e1bd2212b7d8c388b679c3eba22893a";

export default node;
