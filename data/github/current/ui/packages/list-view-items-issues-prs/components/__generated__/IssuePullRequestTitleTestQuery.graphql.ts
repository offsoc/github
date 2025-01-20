/**
 * @generated SignedSource<<0bedb87b9b647c9ff1e627b1f5f3535e>>
 * @relayHash 624127ed9e152cc8bba8e2e53a926e51
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 624127ed9e152cc8bba8e2e53a926e51

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssuePullRequestTitleTestQuery$variables = {
  id: string;
};
export type IssuePullRequestTitleTestQuery$data = {
  readonly data: {
    readonly " $fragmentSpreads": FragmentRefs<"IssuePullRequestTitle">;
  } | null | undefined;
};
export type IssuePullRequestTitleTestQuery = {
  response: IssuePullRequestTitleTestQuery$data;
  variables: IssuePullRequestTitleTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 10
      },
      {
        "kind": "Literal",
        "name": "orderBy",
        "value": {
          "direction": "ASC",
          "field": "NAME"
        }
      }
    ],
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
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nameHTML",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "color",
            "storageKey": null
          },
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
            "name": "description",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "labels(first:10,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
  }
],
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssuePullRequestTitleTestQuery",
    "selections": [
      {
        "alias": "data",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": [
                  {
                    "kind": "Literal",
                    "name": "labelPageSize",
                    "value": 10
                  }
                ],
                "kind": "FragmentSpread",
                "name": "IssuePullRequestTitle"
              }
            ],
            "type": "Issue",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssuePullRequestTitleTestQuery",
    "selections": [
      {
        "alias": "data",
        "args": (v1/*: any*/),
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
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": (v3/*: any*/),
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v3/*: any*/),
                    "type": "PullRequest",
                    "abstractKey": null
                  }
                ],
                "type": "IssueOrPullRequest",
                "abstractKey": "__isIssueOrPullRequest"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "624127ed9e152cc8bba8e2e53a926e51",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "data": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "data.__isIssueOrPullRequest": (v4/*: any*/),
        "data.__typename": (v4/*: any*/),
        "data.id": (v5/*: any*/),
        "data.labels": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "LabelConnection"
        },
        "data.labels.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Label"
        },
        "data.labels.nodes.color": (v4/*: any*/),
        "data.labels.nodes.description": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "data.labels.nodes.id": (v5/*: any*/),
        "data.labels.nodes.name": (v4/*: any*/),
        "data.labels.nodes.nameHTML": (v4/*: any*/),
        "data.number": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        }
      }
    },
    "name": "IssuePullRequestTitleTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e1ea35f49263d711efa3518724728948";

export default node;
