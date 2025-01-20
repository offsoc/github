import {useMemo} from 'react'
import type {Branch} from '../types'

export const enum BRANCH_PROTECTION_STATE {
  protectedByBranchProtections,
  protectedByRulesets,
  unprotected,
}

type useIsBranchProtectedProps = Pick<Branch, 'rulesetsPath' | 'protectedByBranchProtections'>

export default function useIsBranchProtected({rulesetsPath, protectedByBranchProtections}: useIsBranchProtectedProps) {
  return useMemo(() => {
    let state = BRANCH_PROTECTION_STATE.unprotected
    if (rulesetsPath) {
      state = BRANCH_PROTECTION_STATE.protectedByRulesets
    } else if (protectedByBranchProtections) {
      state = BRANCH_PROTECTION_STATE.protectedByBranchProtections
    }
    return {
      isProtectedBy: {
        branchProtections: state === BRANCH_PROTECTION_STATE.protectedByBranchProtections,
        rulesets: state === BRANCH_PROTECTION_STATE.protectedByRulesets,
      },
      isProtected: state !== BRANCH_PROTECTION_STATE.unprotected,
    }
  }, [protectedByBranchProtections, rulesetsPath])
}
