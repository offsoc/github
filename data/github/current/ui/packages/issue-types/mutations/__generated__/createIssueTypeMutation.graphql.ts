/**
 * @generated SignedSource<<61657970ca589e121f8088c0fdd7daca>>
 * @relayHash 5252ea1d85187986fde77893343a5aab
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 5252ea1d85187986fde77893343a5aab

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
export type CreateIssueTypeInput = {
  clientMutationId?: string | null | undefined;
  color?: IssueTypeColor | null | undefined;
  description?: string | null | undefined;
  isEnabled: boolean;
  isPrivate: boolean;
  name: string;
  ownerId: string;
};
export type createIssueTypeMutation$variables = {
  input: CreateIssueTypeInput;
};
export type createIssueTypeMutation$data = {
  readonly createIssueType: {
    readonly errors: ReadonlyArray<{
      readonly message: string;
    }>;
    readonly issueType: {
      readonly color: IssueTypeColor;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly isEnabled: boolean;
      readonly isPrivate: boolean;
      readonly name: string;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueTypeMutation$rawResponse = {
  readonly createIssueType: {
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly message: string;
    }>;
    readonly issueType: {
      readonly color: IssueTypeColor;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly isEnabled: boolean;
      readonly isPrivate: boolean;
      readonly name: string;
    } | null | undefined;
  } | null | undefined;
};
export type createIssueTypeMutation = {
  rawResponse: createIssueTypeMutation$rawResponse;
  response: createIssueTypeMutation$data;
  variables: createIssueTypeMutation$variables;
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
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "issueType",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "color",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEnabled",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
      "storageKey": null
    }
  ],
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
    "name": "createIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateIssueTypePayload",
        "kind": "LinkedField",
        "name": "createIssueType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "name": "createIssueTypeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateIssueTypePayload",
        "kind": "LinkedField",
        "name": "createIssueType",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "id": "5252ea1d85187986fde77893343a5aab",
    "metadata": {},
    "name": "createIssueTypeMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "5e6098995da85d906d936bc5241b7fb5";

export default node;
