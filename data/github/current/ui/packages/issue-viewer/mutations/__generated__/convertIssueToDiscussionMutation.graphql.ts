/**
 * @generated SignedSource<<a0d3ba4aa77fd223e674cd0cebada99d>>
 * @relayHash 9f280c396ededc4627ecab42d4a37ca8
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9f280c396ededc4627ecab42d4a37ca8

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ConvertIssueToDiscussionInput = {
  categoryId: string;
  clientMutationId?: string | null | undefined;
  issueId: string;
};
export type convertIssueToDiscussionMutation$variables = {
  input: ConvertIssueToDiscussionInput;
};
export type convertIssueToDiscussionMutation$data = {
  readonly convertIssueToDiscussion: {
    readonly discussion: {
      readonly url: string;
    } | null | undefined;
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
  } | null | undefined;
};
export type convertIssueToDiscussionMutation$rawResponse = {
  readonly convertIssueToDiscussion: {
    readonly discussion: {
      readonly id: string;
      readonly url: string;
    } | null | undefined;
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
  } | null | undefined;
};
export type convertIssueToDiscussionMutation = {
  rawResponse: convertIssueToDiscussionMutation$rawResponse;
  response: convertIssueToDiscussionMutation$data;
  variables: convertIssueToDiscussionMutation$variables;
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
  "name": "url",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "convertIssueToDiscussionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ConvertIssueToDiscussionPayload",
        "kind": "LinkedField",
        "name": "convertIssueToDiscussion",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Discussion",
            "kind": "LinkedField",
            "name": "discussion",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v3/*: any*/)
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
    "name": "convertIssueToDiscussionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ConvertIssueToDiscussionPayload",
        "kind": "LinkedField",
        "name": "convertIssueToDiscussion",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Discussion",
            "kind": "LinkedField",
            "name": "discussion",
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "9f280c396ededc4627ecab42d4a37ca8",
    "metadata": {},
    "name": "convertIssueToDiscussionMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "9c0881a204d862d4b0167b6ded699944";

export default node;
