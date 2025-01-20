// @ts-check
import {Project, ts} from 'ts-morph'

const EnabledFeaturesApiPath = 'src/client/api/enabled-features/contracts.ts'
const UseEnabledFeaturesHookPath = 'src/client/hooks/use-enabled-features.ts'
const FeatureFlagsHelperPath = 'src/client/helpers/feature-flags.ts'

/**
 * Locate the `useEnabledFeatures` declaration inside the hook file
 *
 * This will error if the hook file doesn't exist, or the `useEnabledFeatures`
 * variable cannot be found in the module
 *
 * @param {Project} project the frontend project relating to src/client/
 */
function findEnabledFeaturesHook(project) {
  const enabledFeaturesHookFile = project.getSourceFileOrThrow(UseEnabledFeaturesHookPath)
  return enabledFeaturesHookFile.getVariableDeclarationOrThrow('useEnabledFeatures')
}

/**
 * Locate the `featureFlags` declaration inside the contracts file and read all values.
 *
 * This will error if the contracts file doesn't exist, or the `featureFlags`
 * variable cannot be found in the module.
 *
 * @param {Project} project the frontend project relating to src/client/
 */
function enumerateAllFeatureFlags(project) {
  const enabledFeaturesHookFile = project.getSourceFileOrThrow(EnabledFeaturesApiPath)
  const node = enabledFeaturesHookFile.getVariableDeclarationOrThrow('featureFlags')
  return enumerateStringLiteralArray(node)
}

/**
 * Locate the `featurePreviews` declaration inside the contracts file and read all values.
 *
 * This will error if the contracts file doesn't exist, or the `featurePreviews`
 * variable cannot be found in the module.
 *
 * @param {Project} project the frontend project relating to src/client/
 */
function enumerateAllFeaturePreviews(project) {
  const enabledFeaturesHookFile = project.getSourceFileOrThrow(EnabledFeaturesApiPath)
  const node = enabledFeaturesHookFile.getVariableDeclarationOrThrow('featurePreviews')
  return enumerateStringLiteralArray(node)
}

/**
 * Locate the `featureGates` declaration inside the contracts file and read all values.
 *
 * This will error if the contracts file doesn't exist, or the `featureGates`
 * variable cannot be found in the module
 *
 * @param {Project} project the frontend project relating to src/client/
 */
function enumerateAllFeatureGates(project) {
  const enabledFeaturesHookFile = project.getSourceFileOrThrow(EnabledFeaturesApiPath)
  const node = enabledFeaturesHookFile.getVariableDeclarationOrThrow('featureGates')
  return enumerateStringLiteralArray(node)
}

/**
 * Locate the `getEnabledFeatures` function in the project
 *
 * @param {Project} project the frontend project relating to src/client/
 */
function findGetEnableFeaturesFunction(project) {
  const sourceFile = project.getSourceFileOrThrow(FeatureFlagsHelperPath)
  return sourceFile.getFunctionOrThrow('getEnabledFeatures')
}

// This is used because Vercel is still on Node 14 which means
// String.prototype.replaceAll is not available - thus we're using
// String.prototype.replace with a regex to emulate this behaviour of removing
// any quote marks found in the enabledFeatures AST
const SingleQuoteReplaceAllRegex = /'/g

/**
 * Enumerate the entries of a `VariableDeclaration` representing an array of string literals.
 *
 * @param {import("ts-morph").VariableDeclaration} variable
 *
 * @returns {Array<string>} array of string values inside, not wrapped in quotes
 */
function enumerateStringLiteralArray(variable) {
  const arrayLiteral = variable.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression)
  const items = arrayLiteral.getDescendantsOfKind(ts.SyntaxKind.StringLiteral)
  return items.map(item => item.getText().replace(SingleQuoteReplaceAllRegex, ''))
}

/**
 * Resolve a reference to the `useFeatureFlag` hook and return the property
 * names found in the source.
 *
 * This code does not care about named imports - when the module is imported at
 * the start of a file - as those are cleaned up automatically if unused and
 * should be caught by linting tools if unused.
 *
 * This currently supports `BindingExpression` and `VariableDeclaration` usages
 * of the hook in the project.
 *
 * @param {import("ts-morph").ReferenceEntry} reference a reference generated
 *        by ts-morph that corresponds to our `useFeatureFlag` hook
 */
function resolveHookReferenceIfValid(reference) {
  const node = reference.getNode()
  const parent = node.getParentOrThrow()
  const grandParent = parent.getParentOrThrow()

  if (
    grandParent.getKind() === ts.SyntaxKind.NamedImports ||
    grandParent.getKind() === ts.SyntaxKind.SourceFile ||
    grandParent.getKind() === ts.SyntaxKind.ReturnStatement ||
    grandParent.getKind() === ts.SyntaxKind.ElementAccessExpression
  ) {
    return []
  }

  const elements = grandParent.getDescendantsOfKind(ts.SyntaxKind.BindingElement)
  if (elements.length > 0) {
    // this code path checks for places where the invoked hook is assigned
    // to local variables
    //
    // ```
    // {memex_date_picker} = useEnabledFeatures()
    // ```
    // this usage is assigning specific keys on the useEnabledFeatures hooks
    // and we can enumerate them easily enough
    return elements.map(element => element.getName())
  }

  if (grandParent.getKind() === ts.SyntaxKind.VariableDeclaration) {
    // this code path looks for places where the hook has been assigned to a
    // local variable, and is invoked later in the current code block
    //
    // ```
    // enabledFeatures = useEnabledFeatures()
    // ...
    // if (!isReadonly && enabledFeatures.memex_date_picker && !workflowsRouteMatch) {
    //   ...
    // }
    // ```

    const variableName = grandParent.getFirstChildByKind(ts.SyntaxKind.Identifier)
    const variableNameText = variableName?.getText()

    const block = grandParent.getFirstAncestorByKindOrThrow(ts.SyntaxKind.Block)
    const callExpressions = block.getDescendantsOfKind(ts.SyntaxKind.CallExpression)
    if (callExpressions.length > 0) {
      const elementNames = []

      for (const expression of callExpressions) {
        const innerExpression = expression.getExpressionIfKind(ts.SyntaxKind.PropertyAccessExpression)
        if (!innerExpression) {
          continue
        }

        const identifer = innerExpression.getExpressionIfKind(ts.SyntaxKind.Identifier)
        if (!identifer) {
          continue
        }

        const identifierText = identifer.getText()
        if (identifierText !== variableNameText) {
          continue
        }

        elementNames.push(innerExpression.getNameNode().getText())
      }

      return elementNames
    }
  }

  if (grandParent.getKind() === ts.SyntaxKind.PropertyAccessExpression) {
    // looking for mock usages of the useEnabledFeatures hook
    //
    // ```
    // asMock(useEnabledFeatures).mockReturnValue({
    //   memex_date_picker: true
    // })
    // ```
    const propertyAccess = grandParent.asKind(ts.SyntaxKind.PropertyAccessExpression)
    if (propertyAccess) {
      const name = propertyAccess.getName()

      if (name === 'mockReturnValue') {
        const callExpression = propertyAccess.getParentIfKind(ts.SyntaxKind.CallExpression)
        if (callExpression) {
          const objectLiteral = callExpression
            .getArguments()
            .find(c => c.getKind() === ts.SyntaxKind.ObjectLiteralExpression)

          if (objectLiteral) {
            const propertyAssignments = objectLiteral.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment)
            const elementNames = []
            for (const propertyAssignment of propertyAssignments) {
              const identifiers = propertyAssignment.getChildrenOfKind(ts.SyntaxKind.Identifier)
              for (const identifier of identifiers) {
                elementNames.push(identifier.getText())
              }
            }

            return elementNames
          }
        }
      }
    }
  }

  const sourceFile = node.getSourceFile()
  const relativePath = sourceFile.getFilePath()
  const nodeText = grandParent.getText()

  throw new Error(
    `Unable to parse reference, found grandparent node ${grandParent.getKindName()} in file: ${relativePath} - node text: '${nodeText}'`,
  )
}

/**
 * Resolve any properties of the hook used by a reference to the useEnabledFeatures
 * hook
 *
 * @param {import("ts-morph").ReferencedSymbol} referencedSymbol
 */
function resolveHookProperties(referencedSymbol) {
  const references = []

  for (const reference of referencedSymbol.getReferences()) {
    // When a hook reference is pointing at itself, it doesn't make sense to resolve it
    if (reference.getSourceFile().getFilePath().includes(UseEnabledFeaturesHookPath)) {
      break
    }
    const result = resolveHookReferenceIfValid(reference)
    if (result) {
      references.push(...result)
    }
  }

  return references
}

/**
 * Read expressions that interact with a property to extract the underlying fields
 * that have been accessed on getEnabledFeatures().
 *
 * @param {import("ts-morph").ReferencedSymbol} referencedSymbol
 */
function resolveFunctionUsages(referencedSymbol) {
  /** @type {Array<string>} */
  const references = []

  for (const reference of referencedSymbol.getReferences()) {
    const result = resolveHookReferenceIfValid(reference)
    if (result) {
      references.push(...result)
    }
  }

  return references
}

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
})

const allFeatureFlags = enumerateAllFeatureFlags(project)
const allFeaturePreviews = enumerateAllFeaturePreviews(project)
const allFeatureGates = enumerateAllFeatureGates(project)

const featuresSet = new Set([...allFeatureFlags, ...allFeaturePreviews, ...allFeatureGates])
const featuresList = [...featuresSet.values()].sort()

const useEnabledFeaturesHook = findEnabledFeaturesHook(project)

/** @type {Set<string>} */
const setOfUsedVariables = new Set()

const referencedHookSymbols = useEnabledFeaturesHook.findReferences()
for (const referencedSymbol of referencedHookSymbols) {
  const foundHookProperties = resolveHookProperties(referencedSymbol)
  for (const prop of foundHookProperties) {
    setOfUsedVariables.add(prop)
  }
}

const getEnabledFeaturesFunction = findGetEnableFeaturesFunction(project)
const referencedFunctionSymbols = getEnabledFeaturesFunction.findReferences()
for (const referencedSymbol of referencedFunctionSymbols) {
  const references = resolveFunctionUsages(referencedSymbol)
  for (const ref of references) {
    setOfUsedVariables.add(ref)
  }
}

for (const property of featuresList) {
  if (property === 'memex_beta_with_dummy_feature') {
    // skip this feature flag as it's a placeholder
    continue
  }

  const isHookNameUnused = setOfUsedVariables.has(property)
  if (!isHookNameUnused) {
    console.warn(
      `hook property '${property}' can be removed from the enabledFeatures array, as it is not used in project`,
    )
  }
}
