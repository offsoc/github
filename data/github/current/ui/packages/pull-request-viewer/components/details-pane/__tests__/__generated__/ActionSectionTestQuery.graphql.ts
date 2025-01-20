/**
 * @generated SignedSource<<7e65a05f6d73e929746efd2687295c64>>
 * @relayHash 322f8ad89b4573ded9ac11a500650324
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 322f8ad89b4573ded9ac11a500650324

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ActionSectionTestQuery$variables = Record<PropertyKey, never>;
export type ActionSectionTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"ActionSection_pullRequest">;
  } | null | undefined;
};
export type ActionSectionTestQuery = {
  response: ActionSectionTestQuery$data;
  variables: ActionSectionTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ActionSectionTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ActionSection_pullRequest"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ActionSectionTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isDraft",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "baseRepository",
                "plural": false,
                "selections": [
                  {
                    "alias": "planSupportsDraftPullRequests",
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "feature",
                        "value": "DRAFT_PRS"
                      }
                    ],
                    "kind": "ScalarField",
                    "name": "planSupports",
                    "storageKey": "planSupports(feature:\"DRAFT_PRS\")"
                  },
                  (v1/*: any*/)
                ],
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
                "name": "viewerCanUpdate",
                "storageKey": null
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id\")"
      }
    ]
  },
  "params": {
    "id": "322f8ad89b4573ded9ac11a500650324",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "pullRequest.baseRepository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.baseRepository.id": (v2/*: any*/),
        "pullRequest.baseRepository.planSupportsDraftPullRequests": (v3/*: any*/),
        "pullRequest.id": (v2/*: any*/),
        "pullRequest.isDraft": (v3/*: any*/),
        "pullRequest.state": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "pullRequest.viewerCanUpdate": (v3/*: any*/)
      }
    },
    "name": "ActionSectionTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "5184b2bda84ca5e7b08e43bcc1b72d17";

export default node;
