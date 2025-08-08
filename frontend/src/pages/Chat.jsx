import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Fetch all users first
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/users/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setAllUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchAllUsers()

    // Connect to socket
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      setLoading(false)
      
      // Join project room if projectId exists
      if (projectId) {
        console.log('Joining room:', projectId)
        newSocket.emit('join-room', projectId)
      } else {
        console.log('No projectId, joining general room')
        newSocket.emit('join-room', 'general')
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Listen for messages
    newSocket.on('message', (message) => {
      console.log('Received message:', message)
      setMessages(prev => [...prev, message])
      
      // Stop AI loading if we receive an AI response
      if (message.isAI) {
        setAiLoading(false)
      }
    })

    // Listen for connection errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      setConnected(false)
    })

    // Listen for user list updates
    newSocket.on('users-update', (users) => {
      console.log('Users update:', users)
      setOnlineUsers(users)
    })

    // Listen for system messages (user joined/left)
    newSocket.on('system-message', (message) => {
      console.log('System message:', message)
      setMessages(prev => [...prev, {
        ...message,
        isSystem: true,
        timestamp: new Date()
      }])
    })

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setLoading(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [projectId])

  useEffect(() => {
    // Scroll to bottom when new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !connected) return

    // Check if it's an AI command
    if (newMessage.startsWith('@ai ')) {
      setAiLoading(true)
    }

    const messageData = {
      text: newMessage,
      timestamp: new Date(),
      room: projectId || 'general'
    }

    console.log('Sending message:', messageData)
    socket.emit('send-message', messageData)
    setNewMessage('')
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
                  const isCurrentUser = message.sender?.email === user?.email
                  return (
                    <div
                      key={index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isSystem
                            ? 'bg-yellow-100 text-black border-l-2 border-yellow-500 text-center'
                            : message.isAI 
                            ? 'bg-blue-100 text-black border-l-4 border-blue-500'
                            : isCurrentUser
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black'
                        }`}
                      >
                        {!isCurrentUser && !message.isAI && !message.isSystem && (
                          <p className="text-xs text-gray-500 mb-1">
                            {message.sender?.email || 'Unknown'}
                          </p>
                        )}
                        {message.isAI && (
                          <p className="text-xs text-blue-600 mb-1 font-medium">
                            🤖 AI Assistant
                          </p>
                        )}
                        <p className={`text-sm ${message.isError ? 'text-red-600' : ''}`}>
                          {message.text}
                        </p>
                        <p className={`text-xs mt-1 ${
                          message.isAI 
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
