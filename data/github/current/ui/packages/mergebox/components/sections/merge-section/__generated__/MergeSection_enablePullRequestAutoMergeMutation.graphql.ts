/**
 * @generated SignedSource<<f971709a3296126c1351a9af65ae6fcc>>
 * @relayHash c30cc9ed82dd36123bd4173528be767d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c30cc9ed82dd36123bd4173528be767d

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MergeQueueMethod = "GROUP" | "JUMP" | "SOLO" | "%future added value";
export type PullRequestMergeMethod = "MERGE" | "REBASE" | "SQUASH" | "%future added value";
export type EnablePullRequestAutoMergeInput = {
  authorEmail?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  commitBody?: string | null | undefined;
  commitHeadline?: string | null | undefined;
  expectedHeadOid?: any | null | undefined;
  mergeMethod?: PullRequestMergeMethod | null | undefined;
  mergeQueueMethod?: MergeQueueMethod | null | undefined;
  pullRequestId: string;
};
export type MergeSection_enablePullRequestAutoMergeMutation$variables = {
  input: EnablePullRequestAutoMergeInput;
};
export type MergeSection_enablePullRequestAutoMergeMutation$data = {
  readonly enablePullRequestAutoMerge: {
    readonly pullRequest: {
      readonly autoMergeRequest: {
        readonly mergeMethod: PullRequestMergeMethod;
      } | null | undefined;
      readonly isInMergeQueue: boolean;
      readonly viewerCanDisableAutoMerge: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type MergeSection_enablePullRequestAutoMergeMutation = {
  response: MergeSection_enablePullRequestAutoMergeMutation$data;
  variables: MergeSection_enablePullRequestAutoMergeMutation$variables;
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
  "concreteType": "AutoMergeRequest",
  "kind": "LinkedField",
  "name": "autoMergeRequest",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mergeMethod",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDisableAutoMerge",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MergeSection_enablePullRequestAutoMergeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EnablePullRequestAutoMergePayload",
        "kind": "LinkedField",
        "name": "enablePullRequestAutoMerge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
    "name": "MergeSection_enablePullRequestAutoMergeMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EnablePullRequestAutoMergePayload",
        "kind": "LinkedField",
        "name": "enablePullRequestAutoMerge",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
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
    "id": "c30cc9ed82dd36123bd4173528be767d",
    "metadata": {},
    "name": "MergeSection_enablePullRequestAutoMergeMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "712be833d2b87a8412315dc097ad822a";

export default node;
