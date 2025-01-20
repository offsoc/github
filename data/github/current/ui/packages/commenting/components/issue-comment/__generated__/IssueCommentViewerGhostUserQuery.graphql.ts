/**
 * @generated SignedSource<<334d4e08ce58cddbd23668a44e3d429d>>
 * @relayHash ec6252bcd5af2a4fab688b0e24e99458
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ec6252bcd5af2a4fab688b0e24e99458

import { ConcreteRequest, Query } from 'relay-runtime';
export type IssueCommentViewerGhostUserQuery$variables = {
  ghostLogin: string;
};
export type IssueCommentViewerGhostUserQuery$data = {
  readonly user: {
    readonly __typename: "User";
    readonly avatarUrl: string;
    readonly login: string;
  } | null | undefined;
};
export type IssueCommentViewerGhostUserQuery = {
  response: IssueCommentViewerGhostUserQuery$data;
  variables: IssueCommentViewerGhostUserQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ghostLogin"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "login",
    "variableName": "ghostLogin"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueCommentViewerGhostUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
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
    "name": "IssueCommentViewerGhostUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
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
    "id": "ec6252bcd5af2a4fab688b0e24e99458",
    "metadata": {},
    "name": "IssueCommentViewerGhostUserQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "f66f505e607780f5a3932be532fa9c15";

export default node;
