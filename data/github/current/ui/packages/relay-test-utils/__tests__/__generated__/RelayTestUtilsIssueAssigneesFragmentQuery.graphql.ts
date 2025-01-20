/**
 * @generated SignedSource<<0a7a3ed2e7907095099e2483d45d69b5>>
 * @relayHash 1cf0e02297d66b71e73af2c891569b1d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1cf0e02297d66b71e73af2c891569b1d

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RelayTestUtilsIssueAssigneesFragmentQuery$variables = Record<PropertyKey, never>;
export type RelayTestUtilsIssueAssigneesFragmentQuery$data = {
  readonly repository: {
    readonly issue: {
      readonly assignees: {
        readonly " $fragmentSpreads": FragmentRefs<"IssueAssignees_SelectedAssigneesFragment">;
      };
    } | null | undefined;
  } | null | undefined;
};
export type RelayTestUtilsIssueAssigneesFragmentQuery = {
  response: RelayTestUtilsIssueAssigneesFragmentQuery$data;
  variables: RelayTestUtilsIssueAssigneesFragmentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "repo"
  },
  {
    "kind": "Literal",
    "name": "owner",
    "value": "owner"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "number",
    "value": 33
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 5
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayTestUtilsIssueAssigneesFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "IssueAssignees_SelectedAssigneesFragment"
                  }
                ],
                "storageKey": "assignees(first:5)"
              }
            ],
            "storageKey": "issue(number:33)"
          }
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayTestUtilsIssueAssigneesFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
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
                "storageKey": "assignees(first:5)"
              },
              (v3/*: any*/)
            ],
            "storageKey": "issue(number:33)"
          },
          (v3/*: any*/)
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      }
    ]
  },
  "params": {
    "id": "1cf0e02297d66b71e73af2c891569b1d",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.id": (v4/*: any*/),
        "repository.issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.assignees": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserConnection"
        },
        "repository.issue.assignees.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "User"
        },
        "repository.issue.assignees.nodes.id": (v4/*: any*/),
        "repository.issue.assignees.nodes.login": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "repository.issue.id": (v4/*: any*/)
      }
    },
    "name": "RelayTestUtilsIssueAssigneesFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6dd6cc063867df4efe1806fa24efde33";

export default node;
