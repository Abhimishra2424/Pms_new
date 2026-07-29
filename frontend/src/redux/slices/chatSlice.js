import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: [],
  onlineUsers: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchConversationsStart(state) {
      state.loading = true;
    },
    fetchConversationsSuccess(state, action) {
      state.loading = false;
      state.conversations = action.payload;
    },
    fetchConversationsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentConversation(state, action) {
      state.currentConversation = action.payload;
      state.messages = [];
      state.pagination.page = 1;
    },
    fetchMessagesStart(state) {
      state.loading = true;
    },
    fetchMessagesSuccess(state, action) {
      state.loading = false;
      state.messages = action.payload.data || action.payload;
      state.pagination.total = action.payload.total || state.messages.length;
    },
    fetchMessagesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    sendMessageStart(state) {
      state.loading = true;
    },
    sendMessageSuccess(state, action) {
      state.loading = false;
      state.messages.push(action.payload);
      state.pagination.total += 1;
    },
    sendMessageFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    receiveMessage(state, action) {
      state.messages.push(action.payload);
      state.pagination.total += 1;
    },
    setTypingUsers(state, action) {
      state.typingUsers = action.payload;
    },
    addTypingUser(state, action) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser(state, action) {
      state.typingUsers = state.typingUsers.filter((id) => id !== action.payload);
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    addOnlineUser(state, action) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser(state, action) {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
    setChatPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearChat(state) {
      state.currentConversation = null;
      state.messages = [];
      state.pagination.page = 1;
    },
  },
});

export const {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  setCurrentConversation,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  receiveMessage,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setChatPage,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
