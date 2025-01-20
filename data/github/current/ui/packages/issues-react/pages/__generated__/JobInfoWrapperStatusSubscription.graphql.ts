/**
 * @generated SignedSource<<b56ad60ce045efbe558ff394394bb488>>
 * @relayHash c6c7ea78576b613fb09a4ef07b376577
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID c6c7ea78576b613fb09a4ef07b376577

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type JobStates = "ERROR" | "PENDING" | "QUEUED" | "STARTED" | "SUCCESS" | "%future added value";
export type JobInfoWrapperStatusSubscription$variables = {
  id: string;
};
export type JobInfoWrapperStatusSubscription$data = {
  readonly jobStatusUpdated: {
    readonly jobStatus: {
      readonly executionErrors: ReadonlyArray<{
        readonly message: string | null | undefined;
        readonly nodeId: string;
      }>;
      readonly jobId: string | null | undefined;
      readonly percentage: number | null | undefined;
      readonly state: JobStates;
      readonly updatedAt: string;
    } | null | undefined;
  };
};
export type JobInfoWrapperStatusSubscription = {
  response: JobInfoWrapperStatusSubscription$data;
  variables: JobInfoWrapperStatusSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "JobStatusUpdatedPayload",
    "kind": "LinkedField",
    "name": "jobStatusUpdated",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "JobStatus",
        "kind": "LinkedField",
        "name": "jobStatus",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "percentage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "jobId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "JobError",
            "kind": "LinkedField",
            "name": "executionErrors",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "message",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "nodeId",
                "storageKey": null
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "JobInfoWrapperStatusSubscription",
    "selections": (v1/*: any*/),
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "JobInfoWrapperStatusSubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "c6c7ea78576b613fb09a4ef07b376577",
    "metadata": {},
    "name": "JobInfoWrapperStatusSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "47f9aec1c876c707ac0b7a218fd72209";

export default node;
