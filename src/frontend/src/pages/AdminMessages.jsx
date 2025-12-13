import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminMessages.css'

export default function AdminMessages() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollingInterval = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const res = await api.get('/messages/conversations')
      setConversations(res.data)
    } catch (e) {
      console.error('Error loading conversations:', e)
    }
  }

  const loadMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/conversation/${userId}`)
      setMessages(res.data)
      scrollToBottom()
      
      // Mark unread messages as read
      const unreadMessages = res.data.filter(msg => !msg.isRead && !msg.isFromAdmin)
      for (const msg of unreadMessages) {
        await api.put(`/messages/${msg._id}/read`)
      }
    } catch (e) {
      console.error('Error loading messages:', e)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadConversations()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId)
      
      // Poll for new messages every 3 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(selectedConversation.userId)
        loadConversations() // Update conversation list too
      }, 3000)
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      await api.post(`/messages/conversation/${selectedConversation.userId}/reply`, {
        content: newMessage.trim()
      })
      setNewMessage('')
      await loadMessages(selectedConversation.userId)
      await loadConversations()
    } catch (e) {
      alert('Có lỗi xảy ra khi gửi tin nhắn')
    }
    setSending(false)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Hôm qua'
    } else if (days < 7) {
      return `${days} ngày trước`
    } else {
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `http://localhost:5000${avatarPath}`
  }

  return (
    <AdminLayout>
      <div className="am-chat-container">
        {/* Conversations Sidebar */}
        <div className="am-chat-sidebar">
          <div className="am-chat-header">
            <h2>Tin nhắn</h2>
            <span className="am-chat-count">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
                <span className="am-unread-badge">
                  {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </span>
          </div>

          <div className="am-chat-search">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="am-chat-list">
            {loading ? (
              <div className="am-chat-loading">Đang tải...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="am-chat-empty">
                <p>Không có cuộc trò chuyện nào</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.userId}
                  className={`am-chat-item ${selectedConversation?.userId === conv.userId ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="am-chat-avatar">
                    {conv.userAvatar ? (
                      <img src={getAvatarUrl(conv.userAvatar)} alt={conv.userName} />
                    ) : (
                      <div className="am-avatar-placeholder">
                        {conv.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="am-avatar-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  <div className="am-chat-info">
                    <div className="am-chat-top">
                      <h4>{conv.userName}</h4>
                      <span className="am-chat-time">{formatDate(conv.lastMessageTime)}</span>
                    </div>
                    <div className="am-chat-bottom">
                      <p className="am-chat-preview">
                        {conv.lastMessageFrom ? '💬 Bạn: ' : ''}
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="am-chat-unread">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="am-chat-main">
          {selectedConversation ? (
            <>
              <div className="am-chat-main-header">
                <div className="am-chat-user-info">
                  <div className="am-chat-avatar large">
                    {selectedConversation.userAvatar ? (
                      <img src={getAvatarUrl(selectedConversation.userAvatar)} alt={selectedConversation.userName} />
                    ) : (
                      <div className="am-avatar-placeholder">
                        {selectedConversation.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{selectedConversation.userName}</h3>
                    <p>{selectedConversation.userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="am-chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`am-chat-message ${msg.isFromAdmin ? 'admin' : 'user'}`}
                  >
                    <div className="am-message-bubble">
                      <p>{msg.content}</p>
                      <span className="am-message-timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="am-chat-input-container" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()} title="Gửi tin nhắn" className="am-send-btn">
                  {sending ? (
                    <svg className="am-spinner" width="22" height="22" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"/>
                    </svg>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="am-chat-placeholder">
              <svg width="80" height="80" fill="currentColor" viewBox="0 0 20 20" opacity="0.3">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
