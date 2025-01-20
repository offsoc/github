const PERSONAL_DOMAINS: string[] = [
  'gmail',
  'yahoo',
  'hotmail',
  'aol',
  'msn',
  'orange',
  'comcast',
  'live',
  'outlook',
  'yandex',
  'me',
  'icloud',
  'verizon',
  'fastmail',
]

const TOP_LEVEL_DOMAINS: string[] = ['com', 'co.uk', 'fr', 'net', 'fm', 'ru']

// checks for email addresses that do not end with certain personal domains and top-level domains
export const EMAIL_PERSONAL_DOMAIN_REGEX = new RegExp(
  `^((?!.*@(${PERSONAL_DOMAINS.join('|')})\\.(${TOP_LEVEL_DOMAINS.join('|')})$)[^\\s]+@[^\\s]+\\.[^\\s]+$)`,
)
