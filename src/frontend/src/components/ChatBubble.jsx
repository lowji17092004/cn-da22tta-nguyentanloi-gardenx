import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import './ChatBubble.css'

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && user) {
      loadMessages()
    }
  }, [isOpen, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Poll for new messages every 30 seconds
    if (user && !isOpen) {
      const interval = setInterval(() => {
        checkUnreadMessages()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user, isOpen])

  const loadMessages = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await api.get('/messages/my-messages')
      setMessages(res.data)
      setUnreadCount(0)
    } catch (err) {
      console.error('Error loading messages:', err)
    }
    setLoading(false)
  }

  const checkUnreadMessages = async () => {
    if (!user) return
    try {
      const res = await api.get('/messages/my-messages')
      const unread = res.data.filter(m => m.status === 'replied' && m.adminReply && !m.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error checking messages:', err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setSending(true)
    try {
      const res = await api.post('/messages', { content: newMessage.trim() })
      setMessages([...messages, res.data])
      setNewMessage('')
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi tin nhắn thất bại')
    }
    setSending(false)
  }

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    
    if (diff < 60000) return 'Vừa xong'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (!user) return null

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-bubble-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat với admin"
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unreadCount > 0 && (
              <span className="chat-bubble-badge">{unreadCount}</span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-bubble-window">
          {/* Header */}
          <div className="chat-bubble-header">
            <div className="chat-bubble-header-info">
              <div className="chat-bubble-avatar">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3>Hỗ trợ khách hàng</h3>
                <p>Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-bubble-messages">
            {loading ? (
              <div className="chat-bubble-loading">
                <div className="spinner"></div>
                <p>Đang tải...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-bubble-empty">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <p>Chưa có tin nhắn nào</p>
                <span>Gửi tin nhắn để được hỗ trợ</span>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg._id} className="chat-bubble-message-group">
                    {/* User message */}
                    <div className="chat-bubble-message user">
                      <div className="chat-bubble-message-content">
                        {msg.content}
                      </div>
                      <div className="chat-bubble-message-time">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>

                    {/* Admin reply */}
                    {msg.adminReply && (
                      <div className="chat-bubble-message admin">
                        <div className="chat-bubble-message-avatar">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="chat-bubble-message-content">
                            {msg.adminReply.content}
                          </div>
                          <div className="chat-bubble-message-time">
                            {formatTime(msg.adminReply.repliedAt)} · Admin
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.status === 'pending' && !msg.adminReply && (
                      <div className="chat-bubble-status">
                        <span className="status-pending">Đang chờ phản hồi...</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form className="chat-bubble-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={!newMessage.trim() || sending} title="Gửi tin nhắn">
              {sending ? (
                <div className="spinner-small"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
