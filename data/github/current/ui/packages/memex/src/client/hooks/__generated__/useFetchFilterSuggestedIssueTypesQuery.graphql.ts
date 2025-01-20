/**
 * @generated SignedSource<<51398a5857174ab861f42dd1f15ceb2d>>
 * @relayHash 2ca7c54da2cefe8741d6ed91728d3931
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 2ca7c54da2cefe8741d6ed91728d3931

import { ConcreteRequest, Query } from 'relay-runtime';
export type useFetchFilterSuggestedIssueTypesQuery$variables = {
  login: string;
  number: number;
};
export type useFetchFilterSuggestedIssueTypesQuery$data = {
  readonly organization: {
    readonly projectV2: {
      readonly suggestedIssueTypeNames: ReadonlyArray<string> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type useFetchFilterSuggestedIssueTypesQuery = {
  response: useFetchFilterSuggestedIssueTypesQuery$data;
  variables: useFetchFilterSuggestedIssueTypesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "login"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "number"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "login",
    "variableName": "login"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "suggestedIssueTypeNames",
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
    "name": "useFetchFilterSuggestedIssueTypesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Organization",
        "kind": "LinkedField",
        "name": "organization",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v3/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFetchFilterSuggestedIssueTypesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Organization",
        "kind": "LinkedField",
        "name": "organization",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "2ca7c54da2cefe8741d6ed91728d3931",
    "metadata": {},
    "name": "useFetchFilterSuggestedIssueTypesQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "552be06f930d82c53af4c0cd3521c6f6";

export default node;
