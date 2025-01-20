import {Box, Text} from '@primer/react'
import type {CertificateAttributes} from '../signed-commit-types'

export default function SmimeCommitFooter({
  subject,
  issuer,
  signingLinkComponent,
}: {
  subject: CertificateAttributes
  issuer: CertificateAttributes
  signingLinkComponent: JSX.Element
}) {
  let subject_org_label = undefined
  if (subject.organization && subject.organization_unit) {
    subject_org_label = 'O/OU'
  } else if (subject.organization) {
    subject_org_label = 'O'
  } else if (subject.organization_unit) {
    subject_org_label = 'OU'
  }

  let issuer_org_label = undefined
  if (issuer.organization && issuer.organization_unit) {
    issuer_org_label = 'O/OU'
  } else if (issuer.organization) {
    issuer_org_label = 'O'
  } else if (issuer.organization_unit) {
    issuer_org_label = 'OU'
  }

  return (
    <Box sx={{display: 'flex'}} data-testid="smime-commit-footer">
      <Box
        sx={{
          fontSize: 0,
          p: 3,
        }}
      >
        <Text sx={{fontWeight: 'bold', fontSize: 1}}>Certificate subject</Text>
        <Box as={'table'} sx={{mb: 1}}>
          {subject.common_name && (
            <tr>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px', color: 'fg.muted'}}>
                CN
              </Box>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px'}}>
                {subject.common_name}
              </Box>
            </tr>
          )}
          {subject.email_address && (
            <tr>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px', color: 'fg.muted'}}>
                emailAddress
              </Box>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px'}}>
                {subject.email_address}
              </Box>
            </tr>
          )}
          {subject_org_label && (
            <tr>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px', color: 'fg.muted'}}>
                {subject_org_label}
              </Box>
              <td>
                {subject.organization}
                {subject_org_label === 'O/OU' && '/'}
                {subject.organization_unit}
              </td>
            </tr>
          )}
        </Box>

        <Text sx={{fontWeight: 'bold', fontSize: 1}}>Certificate issuer</Text>
        <Box as={'table'} sx={{mb: 1}}>
          {issuer.common_name && (
            <tr>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px', color: 'fg.muted'}}>
                CN
              </Box>
              <td>{issuer.common_name}</td>
            </tr>
          )}
          {issuer_org_label && (
            <tr>
              <Box as={'td'} sx={{width: '44px', paddingRight: '12px', color: 'fg.muted'}}>
                {issuer_org_label}
              </Box>
              <td>
                {issuer.organization}
                {issuer_org_label === 'O/OU' && '/'}
                {issuer.organization_unit}
              </td>
            </tr>
          )}
        </Box>

        {signingLinkComponent}
      </Box>
    </Box>
  )
}
