/**
 * @generated SignedSource<<bc38f774be6999f189e3f980e4846b0c>>
 * @relayHash 3bf56b3bceb26a3a975141697beef192
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3bf56b3bceb26a3a975141697beef192

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type AddReactionInput = {
  clientMutationId?: string | null | undefined;
  content: ReactionContent;
  subjectId: string;
};
export type addReactionMutation$variables = {
  input: AddReactionInput;
};
export type addReactionMutation$data = {
  readonly addReaction: {
    readonly subject: {
      readonly reactionGroups: ReadonlyArray<{
        readonly " $fragmentSpreads": FragmentRefs<"ReactionButton_Reaction">;
      }> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type addReactionMutation$rawResponse = {
  readonly addReaction: {
    readonly subject: {
      readonly __typename: string;
      readonly id: string;
      readonly reactionGroups: ReadonlyArray<{
        readonly content: ReactionContent;
        readonly reactors: {
          readonly nodes: ReadonlyArray<{
            readonly __typename: "Bot";
            readonly __isNode: "Bot";
            readonly id: string;
            readonly login: string;
          } | {
            readonly __typename: "Mannequin";
            readonly __isNode: "Mannequin";
            readonly id: string;
            readonly login: string;
          } | {
            readonly __typename: "Organization";
            readonly __isNode: "Organization";
            readonly id: string;
            readonly login: string;
          } | {
            readonly __typename: "User";
            readonly __isNode: "User";
            readonly id: string;
            readonly login: string;
          } | {
            readonly __typename: string;
            readonly __isNode: string;
            readonly id: string;
          } | null | undefined> | null | undefined;
          readonly totalCount: number;
        };
        readonly viewerHasReacted: boolean;
      }> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type addReactionMutation = {
  rawResponse: addReactionMutation$rawResponse;
  response: addReactionMutation$data;
  variables: addReactionMutation$variables;
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
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  }
],
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
    "name": "addReactionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddReactionPayload",
        "kind": "LinkedField",
        "name": "addReaction",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "subject",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ReactionGroup",
                "kind": "LinkedField",
                "name": "reactionGroups",
                "plural": true,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ReactionButton_Reaction"
                  }
                ],
                "storageKey": null
              }
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
    "name": "addReactionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddReactionPayload",
        "kind": "LinkedField",
        "name": "addReaction",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "subject",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ReactionGroup",
                "kind": "LinkedField",
                "name": "reactionGroups",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "content",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 5
                      }
                    ],
                    "concreteType": "ReactorConnection",
                    "kind": "LinkedField",
                    "name": "reactors",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          (v2/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": (v3/*: any*/),
                            "type": "User",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v3/*: any*/),
                            "type": "Bot",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v3/*: any*/),
                            "type": "Organization",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v3/*: any*/),
                            "type": "Mannequin",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v4/*: any*/)
                            ],
                            "type": "Node",
                            "abstractKey": "__isNode"
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "totalCount",
                        "storageKey": null
                      }
                    ],
                    "storageKey": "reactors(first:5)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerHasReacted",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "3bf56b3bceb26a3a975141697beef192",
    "metadata": {},
    "name": "addReactionMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "3ca27abf6be7caf2372a994cb88bf756";

export default node;
