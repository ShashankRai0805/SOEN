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
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:3000', {
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
        newSocket.emit('join-room', projectId)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Listen for messages
    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for user list updates
    newSocket.on('users-update', (users) => {
      setOnlineUsers(users)
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

    const messageData = {
      text: newMessage,
      timestamp: new Date(),
      room: projectId || 'general'
    }

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
            Online Users ({onlineUsers.length})
          </h4>
          <div className="space-y-2">
            {onlineUsers.map((onlineUser, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {onlineUser.email === user?.email ? 'You' : onlineUser.email}
                </span>
              </div>
            ))}
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
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender?.email === user?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender?.email === user?.email
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    {message.sender?.email !== user?.email && (
                      <p className="text-xs text-gray-500 mb-1">
                        {message.sender?.email || 'Unknown'}
                      </p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender?.email === user?.email ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
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
              placeholder="Type your message..."
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
