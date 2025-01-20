// This restriction is based on: https://github.com/github/github/blob/f1b1e40d78ef99d25662f784406f9f88513fb15e/lib/github/config/mysql.rb#L200
const VALIDATOR_VALUES = {
  maxBodyLength: 65536,
  maxIssueTitleLength: 256,
  maxViewTitleLength: 1024,
}

export const VALIDATORS = {
  ...VALIDATOR_VALUES,
  titleCanNotBeEmpty: 'Title can not be empty',
  fieldCanNotBeEmpty: 'Field can not be empty',
  issueTitleExceedsMaxLength: `Title can not be longer than ${VALIDATOR_VALUES.maxIssueTitleLength} characters`,
  viewTitleExceedsMaxLength: `Title can not be longer than ${VALIDATOR_VALUES.maxViewTitleLength} characters`,
  issueBodyExceedsMaxLength: `Body can not be longer than ${VALIDATOR_VALUES.maxBodyLength} characters`,
  fieldExceedsMaxLength: `Field can not be longer than ${VALIDATOR_VALUES.maxBodyLength} characters`,
  commentBodyEmpty: 'Comment can not be empty',
  checkboxInAGroupMustBeSelected: 'A required checkbox is missing',
  missingDropdownSelection: 'An option must be selected',
  noChangesToSave: 'No changes to save',
}

export type ValidationResult = {
  isValid: boolean
  errorMessage?: string
}

export function validateEditIssue(title: string, body: string) {
  const titleValidationResult = validateIssueTitle(title)
  if (!titleValidationResult.isValid) {
    return titleValidationResult
  }

  const bodyValidationResult = validateIssueBody(body)
  if (!bodyValidationResult.isValid) {
    return bodyValidationResult
  }

  return {isValid: true}
}

export function validateIssueTitle(title: string): ValidationResult {
  if (title.trim().length === 0) {
    return {isValid: false, errorMessage: VALIDATORS.titleCanNotBeEmpty}
  } else if (title.length > VALIDATORS.maxIssueTitleLength) {
    return {isValid: false, errorMessage: VALIDATORS.issueTitleExceedsMaxLength}
  }
  return {isValid: true}
}

export function validateTextField(text: string, textEnforced: boolean): ValidationResult {
  if (text.trim().length === 0 && textEnforced) {
    return {isValid: false, errorMessage: VALIDATORS.fieldCanNotBeEmpty}
  } else if (text.length > VALIDATORS.maxBodyLength) {
    return {isValid: false, errorMessage: VALIDATORS.fieldExceedsMaxLength}
  }
  return {isValid: true}
}

export function validateViewTitle(title: string): ValidationResult {
  if (title.trim().length === 0) {
    return {isValid: false, errorMessage: VALIDATORS.titleCanNotBeEmpty}
  } else if (title.length > VALIDATORS.maxViewTitleLength) {
    return {isValid: false, errorMessage: VALIDATORS.viewTitleExceedsMaxLength}
  }
  return {isValid: true}
}

export function validateIssueBody(body: string): ValidationResult {
  if (body.length > VALIDATORS.maxBodyLength) {
    return {isValid: false, errorMessage: VALIDATORS.issueBodyExceedsMaxLength}
  }
  return {isValid: true}
}

export function validateComment(body: string): ValidationResult {
  if (body.length === 0) {
    return {isValid: false, errorMessage: VALIDATORS.commentBodyEmpty}
  }
  return {isValid: true}
}

export function validateNoMarkdown(input: string | null): boolean {
  if (!input) return false

  // regex to check if body does not contain markdown
  return /^([a-zA-Z0-9 .,?^():;"!]*)$/.test(input) && !/^\d+\. /m.test(input)
}
