/**
 * @generated SignedSource<<73d1fd57b2009491c1872b3ab5f44025>>
 * @relayHash 93dc3b03583ff1e7ca5a159bb4220086
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 93dc3b03583ff1e7ca5a159bb4220086

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateIssueCommentInput = {
  body: string;
  bodyVersion?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  id: string;
};
export type updateIssueCommentBodyMutation$variables = {
  input: UpdateIssueCommentInput;
};
export type updateIssueCommentBodyMutation$data = {
  readonly updateIssueComment: {
    readonly issueComment: {
      readonly bodyVersion: string;
      readonly " $fragmentSpreads": FragmentRefs<"IssueCommentViewerMarkdownViewer">;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueCommentBodyMutation$rawResponse = {
  readonly updateIssueComment: {
    readonly issueComment: {
      readonly body: string;
      readonly bodyHTML: string;
      readonly bodyVersion: string;
      readonly id: string;
      readonly viewerCanUpdate: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueCommentBodyMutation = {
  rawResponse: updateIssueCommentBodyMutation$rawResponse;
  response: updateIssueCommentBodyMutation$data;
  variables: updateIssueCommentBodyMutation$variables;
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
  "name": "bodyVersion",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateIssueCommentBodyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssueCommentPayload",
        "kind": "LinkedField",
        "name": "updateIssueComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "issueComment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueCommentViewerMarkdownViewer"
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
    "name": "updateIssueCommentBodyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssueCommentPayload",
        "kind": "LinkedField",
        "name": "updateIssueComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "issueComment",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
                "name": "body",
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "unfurlReferences",
                    "value": true
                  }
                ],
                "kind": "ScalarField",
                "name": "bodyHTML",
                "storageKey": "bodyHTML(unfurlReferences:true)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdate",
                "storageKey": null
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
    "id": "93dc3b03583ff1e7ca5a159bb4220086",
    "metadata": {},
    "name": "updateIssueCommentBodyMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "f4cdbbb6d54b34b2c63e5485bb3c7366";

export default node;
