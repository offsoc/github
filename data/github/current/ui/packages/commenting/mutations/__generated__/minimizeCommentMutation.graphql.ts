/**
 * @generated SignedSource<<0b72aa35b4c9dedabc905506ee9c6e12>>
 * @relayHash 04ba37f7e52d10064ab666f7ddeec8cf
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 04ba37f7e52d10064ab666f7ddeec8cf

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ReportedContentClassifiers = "ABUSE" | "DUPLICATE" | "OFF_TOPIC" | "OUTDATED" | "RESOLVED" | "SPAM" | "%future added value";
export type MinimizeCommentInput = {
  classifier: ReportedContentClassifiers;
  clientMutationId?: string | null | undefined;
  isStaffActor?: boolean | null | undefined;
  reason?: string | null | undefined;
  subjectId: string;
};
export type minimizeCommentMutation$variables = {
  input: MinimizeCommentInput;
};
export type minimizeCommentMutation$data = {
  readonly minimizeComment: {
    readonly clientMutationId: string | null | undefined;
    readonly minimizedComment: {
      readonly isMinimized: boolean;
      readonly minimizedReason: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type minimizeCommentMutation$rawResponse = {
  readonly minimizeComment: {
    readonly clientMutationId: string | null | undefined;
    readonly minimizedComment: {
      readonly __typename: string;
      readonly __isNode: string;
      readonly id: string;
      readonly isMinimized: boolean;
      readonly minimizedReason: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type minimizeCommentMutation = {
  rawResponse: minimizeCommentMutation$rawResponse;
  response: minimizeCommentMutation$data;
  variables: minimizeCommentMutation$variables;
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
    "name": "minimizeCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MinimizeCommentPayload",
        "kind": "LinkedField",
        "name": "minimizeComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "minimizedComment",
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
    "name": "minimizeCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MinimizeCommentPayload",
        "kind": "LinkedField",
        "name": "minimizeComment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "minimizedComment",
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
    "id": "04ba37f7e52d10064ab666f7ddeec8cf",
    "metadata": {},
    "name": "minimizeCommentMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "32b76c06b9ed656b474cba5d4a6b96e4";

export default node;
