/**
 * @generated SignedSource<<0a315cef9ed8d6caf7f02da8412b3cdf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type CheckAnnotationLevel = "FAILURE" | "NOTICE" | "WARNING" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type PullRequestMarkersAnnotations_pullRequest$data = {
  readonly comparison: {
    readonly annotations: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly __id: string;
          readonly annotationLevel: CheckAnnotationLevel | null | undefined;
          readonly checkRun: {
            readonly checkSuite: {
              readonly app: {
                readonly logoUrl: string;
                readonly name: string;
              } | null | undefined;
              readonly name: string | null | undefined;
            };
            readonly detailsUrl: string | null | undefined;
            readonly name: string;
          } | null | undefined;
          readonly databaseId: number | null | undefined;
          readonly location: {
            readonly end: {
              readonly line: number;
            };
            readonly start: {
              readonly line: number;
            };
          };
          readonly message: string;
          readonly path: string;
          readonly pathDigest: string;
          readonly rawDetails: string | null | undefined;
          readonly title: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "PullRequestMarkersAnnotations_pullRequest";
};
export type PullRequestMarkersAnnotations_pullRequest$key = {
  readonly " $data"?: PullRequestMarkersAnnotations_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkersAnnotations_pullRequest">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "PullRequestMarkersAnnotations_pullRequest"
};

(node as any).hash = "60f981c53da825a54f298dc2d6526444";

export default node;
