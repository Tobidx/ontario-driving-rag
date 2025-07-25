import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  DocumentIcon,
  TagIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { cn, copyToClipboard, formatTime } from '../lib/utils'
import { queryRAG, QueryResponse } from '../lib/api'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    sources: Array<{
      content: string
      page: number
      score: number
      category?: string
    }>
    category: string
    duration: number
    queryTime: number
  }
}

const suggestions = [
  "What is the speed limit on highways in Ontario?",
  "What documents do I need for a G1 test?",
  "Can G1 drivers drive on 400-series highways?",
  "What should you do when a school bus has flashing red lights?",
  "What is the blood alcohol limit for drivers?",
  "What are the penalties for distracted driving?"
]

export function ChatPage() {
  const location = useLocation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Pre-populate with question from home page
  useEffect(() => {
    if (location.state?.question) {
      setInput(location.state.question)
    }
  }, [location.state])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const mutation = useMutation<QueryResponse, Error, { question: string }>({
    mutationFn: queryRAG,
    onSuccess: (data: QueryResponse) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: data.data.answer,
        timestamp: new Date(),
        metadata: {
          sources: data.data.sources,
          category: data.data.metadata.category,
          duration: data.data.metadata.duration,
          queryTime: data.data.metadata.queryTime
        }
      }
      
      setMessages(prev => [...prev, assistantMessage])
      toast.success('Response generated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to get response')
      console.error('RAG query error:', error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || mutation.isPending) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    mutation.mutate({ question: input })
    setInput('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const handleCopyMessage = (content: string) => {
    copyToClipboard(content)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            <SparklesIcon className="inline-block h-8 w-8 text-primary mr-2" />
            AI Driving Assistant
          </h1>
          <p className="text-muted-foreground">
            Ask me anything about Ontario driving rules and regulations
          </p>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 mb-6">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <SparklesIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose a suggestion below or type your own question
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 text-left rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
                    >
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                        "{suggestion}"
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 relative group",
                        message.type === 'user'
                          ? "bg-primary text-primary-foreground ml-12"
                          : "bg-card border border-border/50 mr-12"
                      )}
                    >
                      {/* Message content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap m-0">{message.content}</p>
                      </div>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4 text-muted-foreground" />
                      </button>

                      {/* Metadata for assistant messages */}
                      {message.type === 'assistant' && message.metadata && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatTime(message.metadata.queryTime)}
                            </div>
                            <div className="flex items-center gap-1">
                              <DocumentIcon className="h-3 w-3" />
                              {message.metadata.sources.length} sources
                            </div>
                            <div className="flex items-center gap-1">
                              <TagIcon className="h-3 w-3" />
                              {message.metadata.category}
                            </div>
                          </div>

                          {/* Sources */}
                          {message.metadata.sources.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                View Sources ({message.metadata.sources.length})
                              </summary>
                              <div className="mt-2 space-y-2">
                                {message.metadata.sources.map((source, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded bg-muted/50 border border-border/30"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium">Page {source.page}</span>
                                      <span className="text-xs text-muted-foreground">
                                        Score: {source.score.toFixed(3)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                      {source.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground/70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading message */}
                {mutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card border border-border/50 mr-12">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border/50 pt-4"
        >
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about Ontario driving rules..."
              className="w-full resize-none rounded-xl border border-border/50 bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] max-h-32"
              rows={1}
              disabled={mutation.isPending}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || mutation.isPending}
              loading={mutation.isPending}
              className="absolute right-2 bottom-2 h-8 w-8"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </motion.div>
      </div>
    </div>
  )
}