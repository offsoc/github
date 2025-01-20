/**
 * @generated SignedSource<<0621723f2d1e84c71100bdeb042001ae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectsSectionFragment$data = {
  readonly id?: string;
  readonly number?: number;
  readonly projectCards?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: {
          readonly closed: boolean;
          readonly id: string;
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerClassicProject">;
        };
        readonly " $fragmentSpreads": FragmentRefs<"ClassicProjectItem">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly projectItemsNext?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: {
          readonly closed: boolean;
          readonly id: string;
          readonly title: string;
          readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerProject">;
        };
        readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSection">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly repository?: {
    readonly isArchived: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly viewerCanUpdate?: boolean;
  readonly viewerCanUpdateMetadata?: boolean | null | undefined;
  readonly " $fragmentType": "ProjectsSectionFragment";
};
export type ProjectsSectionFragment$key = {
  readonly " $data"?: ProjectsSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectsSectionFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "count": null,
  "cursor": null,
  "direction": "forward",
  "path": [
    "projectItemsNext"
  ]
},
v1 = {
  "count": null,
  "cursor": null,
  "direction": "forward",
  "path": [
    "projectCards"
  ]
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v3/*: any*/),
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
          "name": "login",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isArchived",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "allowedOwner",
    "variableName": "allowedOwner"
  }
],
v7 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "ProjectItemSection"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v13 = {
  "kind": "InlineDataFragmentSpread",
  "name": "ProjectPickerProject",
  "selections": [
    (v5/*: any*/),
    (v8/*: any*/),
    (v9/*: any*/),
    (v2/*: any*/),
    (v10/*: any*/),
    (v11/*: any*/),
    (v12/*: any*/)
  ],
  "args": null,
  "argumentDefinitions": ([]/*: any*/)
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v16 = {
  "alias": "projectCards",
  "args": null,
  "concreteType": "ProjectCardConnection",
  "kind": "LinkedField",
  "name": "__ProjectSection_projectCards_connection",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCardEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectCard",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v5/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ClassicProjectItem"
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Project",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v5/*: any*/),
                (v9/*: any*/),
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "ProjectPickerClassicProject",
                  "selections": [
                    (v5/*: any*/),
                    {
                      "alias": "title",
                      "args": null,
                      "kind": "ScalarField",
                      "name": "name",
                      "storageKey": null
                    },
                    (v9/*: any*/),
                    (v2/*: any*/),
                    (v10/*: any*/),
                    (v11/*: any*/),
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
                          "selections": [
                            (v5/*: any*/),
                            (v3/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "storageKey": "columns(first:10)"
                    },
                    (v12/*: any*/)
                  ],
                  "args": null,
                  "argumentDefinitions": ([]/*: any*/)
                }
              ],
              "storageKey": null
            },
            (v12/*: any*/)
          ],
          "storageKey": null
        },
        (v14/*: any*/)
      ],
      "storageKey": null
    },
    (v15/*: any*/)
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "allowedOwner"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ]
  },
  "name": "ProjectsSectionFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        (v2/*: any*/),
        (v4/*: any*/),
        (v5/*: any*/),
        {
          "kind": "RequiredField",
          "field": {
            "alias": "projectItemsNext",
            "args": (v6/*: any*/),
            "concreteType": "ProjectV2ItemConnection",
            "kind": "LinkedField",
            "name": "__ProjectSection_projectItemsNext_connection",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2ItemEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2Item",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2",
                        "kind": "LinkedField",
                        "name": "project",
                        "plural": false,
                        "selections": [
                          (v13/*: any*/),
                          (v9/*: any*/),
                          (v8/*: any*/),
                          (v5/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              (v15/*: any*/)
            ],
            "storageKey": null
          },
          "action": "THROW",
          "path": "projectItemsNext"
        },
        (v16/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerCanUpdateMetadata",
          "storageKey": null
        }
      ],
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v2/*: any*/),
        (v4/*: any*/),
        (v5/*: any*/),
        {
          "kind": "RequiredField",
          "field": {
            "alias": "projectItemsNext",
            "args": (v6/*: any*/),
            "concreteType": "ProjectV2ItemConnection",
            "kind": "LinkedField",
            "name": "__ProjectSection_projectItemsNext_connection",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2ItemEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2Item",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectV2",
                        "kind": "LinkedField",
                        "name": "project",
                        "plural": false,
                        "selections": [
                          (v9/*: any*/),
                          (v13/*: any*/),
                          (v8/*: any*/),
                          (v5/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v12/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              (v15/*: any*/)
            ],
            "storageKey": null
          },
          "action": "THROW",
          "path": "projectItemsNext"
        },
        (v16/*: any*/),
        (v11/*: any*/)
      ],
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "IssueOrPullRequest",
  "abstractKey": "__isIssueOrPullRequest"
};
})();

(node as any).hash = "79385fd53d1401e21cd05ee942c8acb7";

export default node;
