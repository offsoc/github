/**
 * @generated SignedSource<<dbff0518d568b2067771b27237ad5f82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BaseRefForcePushedEvent_baseRefForcePushedEvent$data = {
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
  readonly " $fragmentType": "BaseRefForcePushedEvent_baseRefForcePushedEvent";
};
export type BaseRefForcePushedEvent_baseRefForcePushedEvent$key = {
  readonly " $data"?: BaseRefForcePushedEvent_baseRefForcePushedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"BaseRefForcePushedEvent_baseRefForcePushedEvent">;
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
  "name": "BaseRefForcePushedEvent_baseRefForcePushedEvent",
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
  "type": "BaseRefForcePushedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "7e0547adca24afa2ec63addc0f4fcd94";

export default node;
