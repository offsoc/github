/**
 * @generated SignedSource<<50974d791f2978da1431b21f2c007e45>>
 * @relayHash 94488330b364e21d44a402f834159915
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 94488330b364e21d44a402f834159915

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateLabelInput = {
  clientMutationId?: string | null | undefined;
  color: string;
  description?: string | null | undefined;
  name: string;
  repositoryId: string;
};
export type createLabelMutation$variables = {
  input: CreateLabelInput;
};
export type createLabelMutation$data = {
  readonly createLabel: {
    readonly label: {
      readonly color: string;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly nameHTML: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type createLabelMutation$rawResponse = {
  readonly createLabel: {
    readonly label: {
      readonly color: string;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly nameHTML: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
};
export type createLabelMutation = {
  rawResponse: createLabelMutation$rawResponse;
  response: createLabelMutation$data;
  variables: createLabelMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateLabelPayload",
    "kind": "LinkedField",
    "name": "createLabel",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Label",
        "kind": "LinkedField",
        "name": "label",
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
            "name": "nameHTML",
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
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "url",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "createLabelMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "createLabelMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "94488330b364e21d44a402f834159915",
    "metadata": {},
    "name": "createLabelMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "1231f9e8c535596d6c60dcdbb81792a6";

export default node;
