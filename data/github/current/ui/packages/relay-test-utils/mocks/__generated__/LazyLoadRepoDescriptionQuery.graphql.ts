/**
 * @generated SignedSource<<070f4e49401e2a140dfc1c5d4d8a57d9>>
 * @relayHash bddc79595bb4cb906c4c73e51f73e7d7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID bddc79595bb4cb906c4c73e51f73e7d7

import { ConcreteRequest, Query } from 'relay-runtime';
export type LazyLoadRepoDescriptionQuery$variables = {
  owner: string;
  repo: string;
};
export type LazyLoadRepoDescriptionQuery$data = {
  readonly repository: {
    readonly description: string | null | undefined;
  } | null | undefined;
};
export type LazyLoadRepoDescriptionQuery = {
  response: LazyLoadRepoDescriptionQuery$data;
  variables: LazyLoadRepoDescriptionQuery$variables;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LazyLoadRepoDescriptionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "LazyLoadRepoDescriptionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "bddc79595bb4cb906c4c73e51f73e7d7",
    "metadata": {},
    "name": "LazyLoadRepoDescriptionQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "d40903db58ceb86364ac9460e882b883";

export default node;
