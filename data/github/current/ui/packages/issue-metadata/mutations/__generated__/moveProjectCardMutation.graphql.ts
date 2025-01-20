/**
 * @generated SignedSource<<524a6ca28df382684dd7a498fc7bcb07>>
 * @relayHash aa600e41891c24c180b03211292d3ba8
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID aa600e41891c24c180b03211292d3ba8

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MoveProjectCardInput = {
  afterCardId?: string | null | undefined;
  cardId: string;
  clientMutationId?: string | null | undefined;
  columnId: string;
};
export type moveProjectCardMutation$variables = {
  connections: ReadonlyArray<string>;
  input: MoveProjectCardInput;
};
export type moveProjectCardMutation$data = {
  readonly moveProjectCard: {
    readonly cardEdge: {
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ClassicProjectItem">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type moveProjectCardMutation$rawResponse = {
  readonly moveProjectCard: {
    readonly cardEdge: {
      readonly node: {
        readonly column: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly id: string;
        readonly project: {
          readonly columns: {
            readonly nodes: ReadonlyArray<{
              readonly id: string;
              readonly name: string;
            } | null | undefined> | null | undefined;
          };
          readonly id: string;
          readonly name: string;
          readonly url: string;
        };
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type moveProjectCardMutation = {
  rawResponse: moveProjectCardMutation$rawResponse;
  response: moveProjectCardMutation$data;
  variables: moveProjectCardMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
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
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*: any*/),
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "moveProjectCardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MoveProjectCardPayload",
        "kind": "LinkedField",
        "name": "moveProjectCard",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectCardEdge",
            "kind": "LinkedField",
            "name": "cardEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectCard",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ClassicProjectItem"
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
    "name": "moveProjectCardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "MoveProjectCardPayload",
        "kind": "LinkedField",
        "name": "moveProjectCard",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectCardEdge",
            "kind": "LinkedField",
            "name": "cardEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectCard",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Project",
                    "kind": "LinkedField",
                    "name": "project",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "url",
                        "storageKey": null
                      },
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 10
                          }
                        ],
                        "concreteType": "ProjectColumnConnection",
                        "kind": "LinkedField",
                        "name": "columns",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectColumn",
                            "kind": "LinkedField",
                            "name": "nodes",
                            "plural": true,
                            "selections": (v4/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": "columns(first:10)"
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectColumn",
                    "kind": "LinkedField",
                    "name": "column",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "cardEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "aa600e41891c24c180b03211292d3ba8",
    "metadata": {},
    "name": "moveProjectCardMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "6a86e21f8a786b8a6c362cd2aafdba8e";

export default node;
