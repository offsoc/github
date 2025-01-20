/**
 * @generated SignedSource<<d06d0c0fdb3240195354ba8a11feb208>>
 * @relayHash edda0b3b0dca6e39455186a59249b420
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID edda0b3b0dca6e39455186a59249b420

import { ConcreteRequest, Query } from 'relay-runtime';
export type OpenClosedTabsQuery$variables = {
  query?: string | null | undefined;
};
export type OpenClosedTabsQuery$data = {
  readonly search: {
    readonly closedIssueCount: number | null | undefined;
    readonly openIssueCount: number | null | undefined;
  };
};
export type OpenClosedTabsQuery = {
  response: OpenClosedTabsQuery$data;
  variables: OpenClosedTabsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": "archived:false assignee:@me sort:updated-desc",
    "kind": "LocalArgument",
    "name": "query"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "aggregations",
        "value": true
      },
      {
        "kind": "Literal",
        "name": "first",
        "value": 0
      },
      {
        "kind": "Variable",
        "name": "query",
        "variableName": "query"
      },
      {
        "kind": "Literal",
        "name": "type",
        "value": "ISSUE"
      }
    ],
    "concreteType": "SearchResultItemConnection",
    "kind": "LinkedField",
    "name": "search",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "closedIssueCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "openIssueCount",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OpenClosedTabsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OpenClosedTabsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "edda0b3b0dca6e39455186a59249b420",
    "metadata": {},
    "name": "OpenClosedTabsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "9078dd104c769dfe8422ca87254368a1";

export default node;
