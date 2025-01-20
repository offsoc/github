/**
 * @generated SignedSource<<601b9dcbd07660f471676baccc15577a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeadRefForcePushedEvent_headRefForcePushedEvent$data = {
  readonly afterCommit: {
    readonly abbreviatedOid: string;
    readonly authoredDate: string;
    readonly authors: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly user: {
            readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
          } | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly oid: any;
  } | null | undefined;
  readonly beforeCommit: {
    readonly abbreviatedOid: string;
    readonly oid: any;
  } | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly refName: string;
  readonly " $fragmentType": "HeadRefForcePushedEvent_headRefForcePushedEvent";
};
export type HeadRefForcePushedEvent_headRefForcePushedEvent$key = {
  readonly " $data"?: HeadRefForcePushedEvent_headRefForcePushedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeadRefForcePushedEvent_headRefForcePushedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeadRefForcePushedEvent_headRefForcePushedEvent",
  "selections": [
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
      "name": "refName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "beforeCommit",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Commit",
      "kind": "LinkedField",
      "name": "afterCommit",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "authoredDate",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 1
            }
          ],
          "concreteType": "GitActorConnection",
          "kind": "LinkedField",
          "name": "authors",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "GitActorEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "GitActor",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "User",
                      "kind": "LinkedField",
                      "name": "user",
                      "plural": false,
                      "selections": [
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "TimelineRowEventActor"
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
          "storageKey": "authors(first:1)"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "HeadRefForcePushedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "389dfec859a59125c80b62bb2d999af9";

export default node;
