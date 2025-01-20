/**
 * @generated SignedSource<<798f7499857275c2ef446cbd5dc57931>>
 * @relayHash d82212dd3a508bc29e75a9719b774461
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d82212dd3a508bc29e75a9719b774461

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesSubscription_TestSubscription$variables = {
  issueId: string;
};
export type SubIssuesSubscription_TestSubscription$data = {
  readonly issueUpdated: {
    readonly issueMetadataUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem">;
    } | null | undefined;
    readonly issueStateUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem">;
    } | null | undefined;
    readonly issueTitleUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem">;
    } | null | undefined;
    readonly subIssuesUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem">;
    } | null | undefined;
  };
};
export type SubIssuesSubscription_TestSubscription = {
  response: SubIssuesSubscription_TestSubscription$data;
  variables: SubIssuesSubscription_TestSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "issueId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "issueId"
  }
],
v2 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "SubIssuesListItem"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  (v4/*: any*/)
],
v8 = [
  (v3/*: any*/),
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
    "kind": "ScalarField",
    "name": "stateReason",
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 10
      }
    ],
    "concreteType": "UserConnection",
    "kind": "LinkedField",
    "name": "assignees",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "avatarUrl",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "assignees(first:10)"
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
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "repository",
    "plural": false,
    "selections": [
      (v6/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "owner",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v5/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "databaseId",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
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
    "name": "titleHTML",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "IssueType",
    "kind": "LinkedField",
    "name": "issueType",
    "plural": false,
    "selections": [
      (v3/*: any*/),
      (v6/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "color",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "SubIssuesSummary",
    "kind": "LinkedField",
    "name": "subIssuesSummary",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "completed",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": "subIssuesConnection",
    "args": null,
    "concreteType": "IssueConnection",
    "kind": "LinkedField",
    "name": "subIssues",
    "plural": false,
    "selections": (v7/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 0
      },
      {
        "kind": "Literal",
        "name": "includeClosedPrs",
        "value": true
      }
    ],
    "concreteType": "PullRequestConnection",
    "kind": "LinkedField",
    "name": "closedByPullRequestsReferences",
    "plural": false,
    "selections": (v7/*: any*/),
    "storageKey": "closedByPullRequestsReferences(first:0,includeClosedPrs:true)"
  }
],
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Issue"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "UserConnection"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "UserEdge"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v15 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v17 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PullRequestConnection"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v19 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "IssueType"
},
v20 = {
  "enumValues": [
    "BLUE",
    "GRAY",
    "GREEN",
    "ORANGE",
    "PINK",
    "PURPLE",
    "RED",
    "YELLOW"
  ],
  "nullable": false,
  "plural": false,
  "type": "IssueTypeColor"
},
v21 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v22 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v23 = {
  "enumValues": [
    "CLOSED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "IssueState"
},
v24 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v25 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "IssueConnection"
},
v26 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "SubIssuesSummary"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SubIssuesSubscription_TestSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTitleUpdated",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueStateUpdated",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueMetadataUpdated",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SubIssuesSubscription_TestSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTitleUpdated",
            "plural": false,
            "selections": (v8/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueStateUpdated",
            "plural": false,
            "selections": (v8/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueMetadataUpdated",
            "plural": false,
            "selections": (v8/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": (v8/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "d82212dd3a508bc29e75a9719b774461",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "issueUpdated": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueUpdatedPayload"
        },
        "issueUpdated.issueMetadataUpdated": (v9/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees": (v10/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.edges": (v11/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.edges.node": (v12/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.edges.node.avatarUrl": (v13/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.edges.node.id": (v14/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.edges.node.login": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.assignees.totalCount": (v16/*: any*/),
        "issueUpdated.issueMetadataUpdated.closedByPullRequestsReferences": (v17/*: any*/),
        "issueUpdated.issueMetadataUpdated.closedByPullRequestsReferences.totalCount": (v16/*: any*/),
        "issueUpdated.issueMetadataUpdated.databaseId": (v18/*: any*/),
        "issueUpdated.issueMetadataUpdated.id": (v14/*: any*/),
        "issueUpdated.issueMetadataUpdated.issueType": (v19/*: any*/),
        "issueUpdated.issueMetadataUpdated.issueType.color": (v20/*: any*/),
        "issueUpdated.issueMetadataUpdated.issueType.id": (v14/*: any*/),
        "issueUpdated.issueMetadataUpdated.issueType.name": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.number": (v16/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository": (v21/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.id": (v14/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.name": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.owner": (v22/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.owner.__typename": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.owner.id": (v14/*: any*/),
        "issueUpdated.issueMetadataUpdated.repository.owner.login": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.state": (v23/*: any*/),
        "issueUpdated.issueMetadataUpdated.stateReason": (v24/*: any*/),
        "issueUpdated.issueMetadataUpdated.subIssuesConnection": (v25/*: any*/),
        "issueUpdated.issueMetadataUpdated.subIssuesConnection.totalCount": (v16/*: any*/),
        "issueUpdated.issueMetadataUpdated.subIssuesSummary": (v26/*: any*/),
        "issueUpdated.issueMetadataUpdated.subIssuesSummary.completed": (v16/*: any*/),
        "issueUpdated.issueMetadataUpdated.title": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.titleHTML": (v15/*: any*/),
        "issueUpdated.issueMetadataUpdated.url": (v13/*: any*/),
        "issueUpdated.issueStateUpdated": (v9/*: any*/),
        "issueUpdated.issueStateUpdated.assignees": (v10/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.edges": (v11/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.edges.node": (v12/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.edges.node.avatarUrl": (v13/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.edges.node.id": (v14/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.edges.node.login": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.assignees.totalCount": (v16/*: any*/),
        "issueUpdated.issueStateUpdated.closedByPullRequestsReferences": (v17/*: any*/),
        "issueUpdated.issueStateUpdated.closedByPullRequestsReferences.totalCount": (v16/*: any*/),
        "issueUpdated.issueStateUpdated.databaseId": (v18/*: any*/),
        "issueUpdated.issueStateUpdated.id": (v14/*: any*/),
        "issueUpdated.issueStateUpdated.issueType": (v19/*: any*/),
        "issueUpdated.issueStateUpdated.issueType.color": (v20/*: any*/),
        "issueUpdated.issueStateUpdated.issueType.id": (v14/*: any*/),
        "issueUpdated.issueStateUpdated.issueType.name": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.number": (v16/*: any*/),
        "issueUpdated.issueStateUpdated.repository": (v21/*: any*/),
        "issueUpdated.issueStateUpdated.repository.id": (v14/*: any*/),
        "issueUpdated.issueStateUpdated.repository.name": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.repository.owner": (v22/*: any*/),
        "issueUpdated.issueStateUpdated.repository.owner.__typename": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.repository.owner.id": (v14/*: any*/),
        "issueUpdated.issueStateUpdated.repository.owner.login": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.state": (v23/*: any*/),
        "issueUpdated.issueStateUpdated.stateReason": (v24/*: any*/),
        "issueUpdated.issueStateUpdated.subIssuesConnection": (v25/*: any*/),
        "issueUpdated.issueStateUpdated.subIssuesConnection.totalCount": (v16/*: any*/),
        "issueUpdated.issueStateUpdated.subIssuesSummary": (v26/*: any*/),
        "issueUpdated.issueStateUpdated.subIssuesSummary.completed": (v16/*: any*/),
        "issueUpdated.issueStateUpdated.title": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.titleHTML": (v15/*: any*/),
        "issueUpdated.issueStateUpdated.url": (v13/*: any*/),
        "issueUpdated.issueTitleUpdated": (v9/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees": (v10/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.edges": (v11/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.edges.node": (v12/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.edges.node.avatarUrl": (v13/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.edges.node.id": (v14/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.edges.node.login": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.assignees.totalCount": (v16/*: any*/),
        "issueUpdated.issueTitleUpdated.closedByPullRequestsReferences": (v17/*: any*/),
        "issueUpdated.issueTitleUpdated.closedByPullRequestsReferences.totalCount": (v16/*: any*/),
        "issueUpdated.issueTitleUpdated.databaseId": (v18/*: any*/),
        "issueUpdated.issueTitleUpdated.id": (v14/*: any*/),
        "issueUpdated.issueTitleUpdated.issueType": (v19/*: any*/),
        "issueUpdated.issueTitleUpdated.issueType.color": (v20/*: any*/),
        "issueUpdated.issueTitleUpdated.issueType.id": (v14/*: any*/),
        "issueUpdated.issueTitleUpdated.issueType.name": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.number": (v16/*: any*/),
        "issueUpdated.issueTitleUpdated.repository": (v21/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.id": (v14/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.name": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.owner": (v22/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.owner.__typename": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.owner.id": (v14/*: any*/),
        "issueUpdated.issueTitleUpdated.repository.owner.login": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.state": (v23/*: any*/),
        "issueUpdated.issueTitleUpdated.stateReason": (v24/*: any*/),
        "issueUpdated.issueTitleUpdated.subIssuesConnection": (v25/*: any*/),
        "issueUpdated.issueTitleUpdated.subIssuesConnection.totalCount": (v16/*: any*/),
        "issueUpdated.issueTitleUpdated.subIssuesSummary": (v26/*: any*/),
        "issueUpdated.issueTitleUpdated.subIssuesSummary.completed": (v16/*: any*/),
        "issueUpdated.issueTitleUpdated.title": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.titleHTML": (v15/*: any*/),
        "issueUpdated.issueTitleUpdated.url": (v13/*: any*/),
        "issueUpdated.subIssuesUpdated": (v9/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees": (v10/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.edges": (v11/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.edges.node": (v12/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.edges.node.avatarUrl": (v13/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.edges.node.id": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.edges.node.login": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.assignees.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.closedByPullRequestsReferences": (v17/*: any*/),
        "issueUpdated.subIssuesUpdated.closedByPullRequestsReferences.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.databaseId": (v18/*: any*/),
        "issueUpdated.subIssuesUpdated.id": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.issueType": (v19/*: any*/),
        "issueUpdated.subIssuesUpdated.issueType.color": (v20/*: any*/),
        "issueUpdated.subIssuesUpdated.issueType.id": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.issueType.name": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.number": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.repository": (v21/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.id": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.name": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner": (v22/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.__typename": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.id": (v14/*: any*/),
        "issueUpdated.subIssuesUpdated.repository.owner.login": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.state": (v23/*: any*/),
        "issueUpdated.subIssuesUpdated.stateReason": (v24/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesConnection": (v25/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesConnection.totalCount": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesSummary": (v26/*: any*/),
        "issueUpdated.subIssuesUpdated.subIssuesSummary.completed": (v16/*: any*/),
        "issueUpdated.subIssuesUpdated.title": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.titleHTML": (v15/*: any*/),
        "issueUpdated.subIssuesUpdated.url": (v13/*: any*/)
      }
    },
    "name": "SubIssuesSubscription_TestSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "80a9ed62e8eb410ba5cf44920e720be2";

export default node;
