import {Box, Text} from '@primer/react'
import type {Language} from '../../types'

interface LanguageWithColorProps {
  languages: Language[]
}

export function LanguagesWithColor({languages}: LanguageWithColorProps) {
  return (
    <Box sx={{display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '4px'}}>
      {languages.map(language => (
        <Box key={language.id} sx={{alignItems: 'center', display: 'flex', gap: '8px'}}>
          <Box sx={{backgroundColor: language.color, borderRadius: '9999px', height: '10px', width: '10px'}} />
          <Box sx={{alignItems: 'center', display: 'flex', gap: '4px'}}>
            <Text sx={{fontSize: '12px', fontWeight: 600}}>{language.name}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
