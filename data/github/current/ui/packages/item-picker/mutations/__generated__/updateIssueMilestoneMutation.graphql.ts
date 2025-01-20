/**
 * @generated SignedSource<<5a1a13d9e2ea24d4bab7cd81dcfb1c8f>>
 * @relayHash 816c5a915fa9ac873e161bc88c6c7cd7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 816c5a915fa9ac873e161bc88c6c7cd7

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type UpdateIssueInput = {
  assigneeIds?: ReadonlyArray<string> | null | undefined;
  body?: string | null | undefined;
  bodyVersion?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  id: string;
  issueTypeId?: string | null | undefined;
  labelIds?: ReadonlyArray<string> | null | undefined;
  milestoneId?: string | null | undefined;
  projectIds?: ReadonlyArray<string> | null | undefined;
  state?: IssueState | null | undefined;
  tasklistBlocksOperation?: string | null | undefined;
  title?: string | null | undefined;
};
export type updateIssueMilestoneMutation$variables = {
  input: UpdateIssueInput;
};
export type updateIssueMilestoneMutation$data = {
  readonly updateIssue: {
    readonly issue: {
      readonly id: string;
      readonly milestone: {
        readonly " $fragmentSpreads": FragmentRefs<"MilestonePickerMilestone">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueMilestoneMutation$rawResponse = {
  readonly updateIssue: {
    readonly issue: {
      readonly id: string;
      readonly milestone: {
        readonly closed: boolean;
        readonly closedAt: string | null | undefined;
        readonly dueOn: string | null | undefined;
        readonly id: string;
        readonly progressPercentage: number;
        readonly title: string;
        readonly url: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type updateIssueMilestoneMutation = {
  rawResponse: updateIssueMilestoneMutation$rawResponse;
  response: updateIssueMilestoneMutation$data;
  variables: updateIssueMilestoneMutation$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "title",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "closed",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "dueOn",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "progressPercentage",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "closedAt",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updateIssueMilestoneMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssuePayload",
        "kind": "LinkedField",
        "name": "updateIssue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Milestone",
                "kind": "LinkedField",
                "name": "milestone",
                "plural": false,
                "selections": [
                  {
                    "kind": "InlineDataFragmentSpread",
                    "name": "MilestonePickerMilestone",
                    "selections": (v3/*: any*/),
                    "args": null,
                    "argumentDefinitions": []
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
    "name": "updateIssueMilestoneMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateIssuePayload",
        "kind": "LinkedField",
        "name": "updateIssue",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Milestone",
                "kind": "LinkedField",
                "name": "milestone",
                "plural": false,
                "selections": (v3/*: any*/),
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
    "id": "816c5a915fa9ac873e161bc88c6c7cd7",
    "metadata": {},
    "name": "updateIssueMilestoneMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "7302553b3cbaeec71894985dcc50a52b";

export default node;
