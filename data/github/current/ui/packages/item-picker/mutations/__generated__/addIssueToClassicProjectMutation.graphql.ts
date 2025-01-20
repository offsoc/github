/**
 * @generated SignedSource<<2ee721efc3b5a4e140c0c84b3115602b>>
 * @relayHash cbd33dd7e70001431b6d0502f1119fe4
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cbd33dd7e70001431b6d0502f1119fe4

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AddProjectCardInput = {
  clientMutationId?: string | null | undefined;
  contentId?: string | null | undefined;
  note?: string | null | undefined;
  projectColumnId: string;
};
export type addIssueToClassicProjectMutation$variables = {
  connections: ReadonlyArray<string>;
  input: AddProjectCardInput;
};
export type addIssueToClassicProjectMutation$data = {
  readonly addProjectCard: {
    readonly cardEdge: {
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"ClassicProjectItem">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type addIssueToClassicProjectMutation$rawResponse = {
  readonly addProjectCard: {
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
export type addIssueToClassicProjectMutation = {
  rawResponse: addIssueToClassicProjectMutation$rawResponse;
  response: addIssueToClassicProjectMutation$data;
  variables: addIssueToClassicProjectMutation$variables;
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
    "name": "addIssueToClassicProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddProjectCardPayload",
        "kind": "LinkedField",
        "name": "addProjectCard",
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
    "name": "addIssueToClassicProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddProjectCardPayload",
        "kind": "LinkedField",
        "name": "addProjectCard",
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
    "id": "cbd33dd7e70001431b6d0502f1119fe4",
    "metadata": {},
    "name": "addIssueToClassicProjectMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "dafb141ed972776b7080efcc9a8fb6a2";

export default node;
