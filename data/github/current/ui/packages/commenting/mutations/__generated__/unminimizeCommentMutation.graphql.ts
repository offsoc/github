/**
 * @generated SignedSource<<1630a328dee70d5217bb133f649219e3>>
 * @relayHash 988dd6bb9180a9aaf6aa1e5b469f0443
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 988dd6bb9180a9aaf6aa1e5b469f0443

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnminimizeCommentInput = {
  clientMutationId?: string | null | undefined;
  isStaffActor?: boolean | null | undefined;
  reason?: string | null | undefined;
  subjectId: string;
};
export type unminimizeCommentMutation$variables = {
  input: UnminimizeCommentInput;
};
export type unminimizeCommentMutation$data = {
  readonly unminimizeComment: {
    readonly clientMutationId: string | null | undefined;
    readonly unminimizedComment: {
      readonly isMinimized: boolean;
      readonly minimizedReason: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type unminimizeCommentMutation$rawResponse = {
  readonly unminimizeComment: {
    readonly clientMutationId: string | null | undefined;
    readonly unminimizedComment: {
      readonly __typename: string;
      readonly __isNode: string;
      readonly id: string;
      readonly isMinimized: boolean;
      readonly minimizedReason: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type unminimizeCommentMutation = {
  rawResponse: unminimizeCommentMutation$rawResponse;
  response: unminimizeCommentMutation$data;
  variables: unminimizeCommentMutation$variables;
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
  "name": "clientMutationId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unminimizeCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnminimizeCommentPayload",
        "kind": "LinkedField",
        "name": "unminimizeComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "unminimizedComment",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
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
    "name": "unminimizeCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnminimizeCommentPayload",
        "kind": "LinkedField",
        "name": "unminimizeComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "unminimizedComment",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "type": "Node",
                "abstractKey": "__isNode"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "988dd6bb9180a9aaf6aa1e5b469f0443",
    "metadata": {},
    "name": "unminimizeCommentMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "03ac2faeeddfe3c11f404095d6800e93";

export default node;
