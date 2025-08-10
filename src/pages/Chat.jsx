import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [connected, setConnected] = useState(true)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const pollingRef = useRef(null)
  const lastMessageTime = useRef(null)

  useEffect(() => {
    // Fetch all users first
    const fetchAllUsers = async () => {
      try {
        const endpoint = process.env.NODE_ENV === 'production' 
          ? '/api?endpoint=users' 
          : '/users/all'
        
        const response = await axios.get(endpoint)
        if (response.data.success) {
          setAllUsers(response.data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchAllUsers()

    // Start polling for messages
    const pollMessages = async () => {
      try {
        const room = projectId || 'general'
        const endpoint = process.env.NODE_ENV === 'production' 
          ? '/api?endpoint=chat-messages' 
          : '/chat/messages'
        
        const params = { 
          room,
          ...(lastMessageTime.current && { since: lastMessageTime.current })
        }
        
        const response = await axios.get(endpoint, { params })
        
        if (response.data.success) {
          const { messages: newMessages, onlineUsers: users } = response.data
          
          if (newMessages.length > 0) {
            setMessages(prev => {
              // If this is the first fetch, replace all messages
              if (!lastMessageTime.current) {
                return newMessages
              }
              // Otherwise, append new messages
              return [...prev, ...newMessages]
            })
            
            // Update last message time
            lastMessageTime.current = newMessages[newMessages.length - 1]?.timestamp
            
            // Stop AI loading if we receive an AI response
            if (newMessages.some(msg => msg.type === 'ai')) {
              setAiLoading(false)
            }
          }
          
          setOnlineUsers(users || [])
          setConnected(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setConnected(false)
      }
    }

    // Initial fetch
    pollMessages()

    // Set up polling every 2 seconds
    pollingRef.current = setInterval(pollMessages, 2000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [projectId, user])

  // Auto-scroll to bottom when new messages arrive

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setLoading(false)
    })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const room = projectId || 'general'
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api?endpoint=chat-messages' 
        : '/chat/messages'

      // Check if it's an AI command
      if (newMessage.startsWith('@ai ')) {
        setAiLoading(true)
        
        // Send AI request
        const aiEndpoint = process.env.NODE_ENV === 'production' 
          ? '/api?endpoint=chat-ai' 
          : '/chat/ai'
        
        try {
          const aiResponse = await axios.post(aiEndpoint, {
            message: newMessage.slice(4) // Remove '@ai ' prefix
          })
          
          // Send the AI response as a message
          await axios.post(endpoint, {
            message: aiResponse.data.aiResponse,
            room,
            user: {
              email: 'AI Assistant',
              _id: 'ai'
            },
            type: 'ai'
          })
          
        } catch (aiError) {
          console.error('AI error:', aiError)
          setAiLoading(false)
        }
      }

      // Send the user message
      await axios.post(endpoint, {
        message: newMessage,
        room,
        user: {
          email: user.email,
          _id: user._id || user.email
        },
        type: 'message'
      })

      setNewMessage('')
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-black mb-2">
            {projectId ? 'Project Chat' : 'General Chat'}
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Users ({allUsers.length})
          </h4>
          <div className="space-y-2">
            {allUsers.map((userItem, index) => {
              const isOnline = onlineUsers.some(onlineUser => onlineUser.email === userItem.email)
              const isCurrentUser = userItem.email === user?.email
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-sm ${isOnline ? 'text-gray-900' : 'text-gray-500'}`}>
                    {isCurrentUser ? 'You' : userItem.email}
                    {isCurrentUser && <span className="text-xs text-blue-600 ml-1">(You)</span>}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isCurrentUser = message.user?.email === user?.email
                  const isAI = message.type === 'ai'
                  const isSystem = message.type === 'system'
                  
                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${isCurrentUser && !isAI ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isSystem
                            ? 'bg-yellow-100 text-black border-l-2 border-yellow-500 text-center'
                            : isAI 
                            ? 'bg-blue-100 text-black border-l-4 border-blue-500'
                            : isCurrentUser
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black'
                        }`}
                      >
                        {!isCurrentUser && !isAI && !isSystem && (
                          <p className="text-xs text-gray-500 mb-1">
                            {message.user?.email || 'Unknown'}
                          </p>
                        )}
                        {isAI && (
                          <p className="text-xs text-blue-600 mb-1 font-medium">
                            🤖 AI Assistant
                          </p>
                        )}
                        <p className="text-sm">
                          {message.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isAI 
                            ? 'text-blue-500' 
                            : isCurrentUser
                            ? 'text-gray-300' 
                            : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-100 text-black border-l-4 border-blue-500 px-4 py-2 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1 font-medium">
                        🤖 AI Assistant
                      </p>
                      <p className="text-sm">Thinking...</p>
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message or @ai to ask AI..."
              className="flex-1 input-primary"
              disabled={!connected}
            />
            <button
              type="submit"
              disabled={!connected || !newMessage.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500">
            💡 Tip: Type "@ai" followed by your question to get AI assistance
          </div>
          {!connected && (
            <p className="text-sm text-red-500 mt-2">
              Disconnected from chat. Trying to reconnect...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
