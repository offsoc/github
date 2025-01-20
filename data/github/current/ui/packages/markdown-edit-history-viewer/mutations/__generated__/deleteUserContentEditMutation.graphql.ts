/**
 * @generated SignedSource<<1810bd0209bd28b4919d808344c18703>>
 * @relayHash 71452b9f40a7828ac05811d1ad4f821e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 71452b9f40a7828ac05811d1ad4f821e

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteUserContentEditInput = {
  clientMutationId?: string | null | undefined;
  id: string;
};
export type deleteUserContentEditMutation$variables = {
  input: DeleteUserContentEditInput;
};
export type deleteUserContentEditMutation$data = {
  readonly deleteUserContentEdit: {
    readonly userContentEdit: {
      readonly deletedAt: string | null | undefined;
      readonly deletedBy: {
        readonly avatarUrl: string;
        readonly login: string;
      } | null | undefined;
      readonly diff: string | null | undefined;
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteUserContentEditMutation$rawResponse = {
  readonly deleteUserContentEdit: {
    readonly userContentEdit: {
      readonly deletedAt: string | null | undefined;
      readonly deletedBy: {
        readonly __typename: string;
        readonly avatarUrl: string;
        readonly id: string;
        readonly login: string;
      } | null | undefined;
      readonly diff: string | null | undefined;
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deleteUserContentEditMutation = {
  rawResponse: deleteUserContentEditMutation$rawResponse;
  response: deleteUserContentEditMutation$data;
  variables: deleteUserContentEditMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedAt",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "diff",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteUserContentEditMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteUserContentEditPayload",
        "kind": "LinkedField",
        "name": "deleteUserContentEdit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserContentEdit",
            "kind": "LinkedField",
            "name": "userContentEdit",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "deletedBy",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "deleteUserContentEditMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteUserContentEditPayload",
        "kind": "LinkedField",
        "name": "deleteUserContentEdit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserContentEdit",
            "kind": "LinkedField",
            "name": "userContentEdit",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "deletedBy",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "71452b9f40a7828ac05811d1ad4f821e",
    "metadata": {},
    "name": "deleteUserContentEditMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "45e1f3e7d425560f65ef39e8c357794d";

export default node;
