import type {Subject} from '@github-ui/comment-box/subject'
import {createContext, useContext} from 'react'

const ConversationMarkdownSubjectContext = createContext<Subject | null>(null)

export const useConversationMarkdownSubjectContext = () => useContext(ConversationMarkdownSubjectContext)

export const ConversationMarkdownSubjectProvider = ConversationMarkdownSubjectContext.Provider
