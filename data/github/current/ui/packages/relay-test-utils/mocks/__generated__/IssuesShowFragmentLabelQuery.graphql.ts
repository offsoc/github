/**
 * @generated SignedSource<<ce4bd13462732b18190e06c1358fd207>>
 * @relayHash 618dafc889c601a013a08df28c6d9b9a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 618dafc889c601a013a08df28c6d9b9a

import { ConcreteRequest, Query } from 'relay-runtime';
export type IssuesShowFragmentLabelQuery$variables = {
  owner: string;
  repo: string;
};
export type IssuesShowFragmentLabelQuery$data = {
  readonly repository: {
    readonly labels: {
      readonly nodes: ReadonlyArray<{
        readonly name: string;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type IssuesShowFragmentLabelQuery = {
  response: IssuesShowFragmentLabelQuery$data;
  variables: IssuesShowFragmentLabelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "owner"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "repo"
  }
],
v1 = [
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
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 3
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssuesShowFragmentLabelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
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
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "labels(first:3)"
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
    "name": "IssuesShowFragmentLabelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": "labels(first:3)"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "618dafc889c601a013a08df28c6d9b9a",
    "metadata": {},
    "name": "IssuesShowFragmentLabelQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b2b841fe8779ce7fa30f9762d32fcd04";

export default node;
