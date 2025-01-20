/**
 * @generated SignedSource<<110a1e2932a7fd2e057acca1f0fa62dd>>
 * @relayHash 7b526489d1e08174583970802a93417f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7b526489d1e08174583970802a93417f

import { ConcreteRequest, Query } from 'relay-runtime';
export type typeFilterProjectIssueTypeQuery$variables = {
  login: string;
  number: number;
};
export type typeFilterProjectIssueTypeQuery$data = {
  readonly organization: {
    readonly projectV2: {
      readonly suggestedIssueTypeNames: ReadonlyArray<string> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type typeFilterProjectIssueTypeQuery = {
  response: typeFilterProjectIssueTypeQuery$data;
  variables: typeFilterProjectIssueTypeQuery$variables;
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
    "name": "typeFilterProjectIssueTypeQuery",
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
    "name": "typeFilterProjectIssueTypeQuery",
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
    "id": "7b526489d1e08174583970802a93417f",
    "metadata": {},
    "name": "typeFilterProjectIssueTypeQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "60d6d2b3409ce4dee63013753e4acfe2";

export default node;
