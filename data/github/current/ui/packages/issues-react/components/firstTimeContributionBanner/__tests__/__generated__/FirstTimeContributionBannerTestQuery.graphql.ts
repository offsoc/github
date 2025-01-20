/**
 * @generated SignedSource<<2756a2fa4040eaec074272768828c5d8>>
 * @relayHash 2d936d5443d0221618af02eb98fced94
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 2d936d5443d0221618af02eb98fced94

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FirstTimeContributionBannerTestQuery$variables = Record<PropertyKey, never>;
export type FirstTimeContributionBannerTestQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"FirstTimeContributionBanner">;
  } | null | undefined;
};
export type FirstTimeContributionBannerTestQuery = {
  response: FirstTimeContributionBannerTestQuery$data;
  variables: FirstTimeContributionBannerTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "repo"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FirstTimeContributionBannerTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "FirstTimeContributionBanner"
              }
            ],
            "type": "Repository",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"repo\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "FirstTimeContributionBannerTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "isPullRequests",
                    "value": false
                  }
                ],
                "kind": "ScalarField",
                "name": "showFirstTimeContributorBanner",
                "storageKey": "showFirstTimeContributorBanner(isPullRequests:false)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "nameWithOwner",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ContributingGuidelines",
                "kind": "LinkedField",
                "name": "contributingGuidelines",
                "plural": false,
                "selections": [
                  (v1/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CommunityProfile",
                "kind": "LinkedField",
                "name": "communityProfile",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "goodFirstIssueIssuesCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v1/*: any*/)
            ],
            "type": "Repository",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"repo\")"
      }
    ]
  },
  "params": {
    "id": "2d936d5443d0221618af02eb98fced94",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v2/*: any*/),
        "node.communityProfile": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CommunityProfile"
        },
        "node.communityProfile.goodFirstIssueIssuesCount": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "node.contributingGuidelines": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ContributingGuidelines"
        },
        "node.contributingGuidelines.url": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.nameWithOwner": (v2/*: any*/),
        "node.showFirstTimeContributorBanner": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "node.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        }
      }
    },
    "name": "FirstTimeContributionBannerTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "69e5354bf90b7216c39cbbb87109d7fa";

export default node;
