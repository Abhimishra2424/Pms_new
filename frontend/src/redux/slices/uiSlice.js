import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  activeModal: null,
  modalData: null,
  selectedBoardView: 'kanban',
  globalSearch: '',
  pageTitle: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    openModal(state, action) {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalData = null;
    },
    setSelectedBoardView(state, action) {
      state.selectedBoardView = action.payload;
    },
    setGlobalSearch(state, action) {
      state.globalSearch = action.payload;
    },
    setPageTitle(state, action) {
      state.pageTitle = action.payload;
    },
    resetUI(state) {
      state.sidebarOpen = true;
      state.sidebarCollapsed = false;
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  openModal,
  closeModal,
  setSelectedBoardView,
  setGlobalSearch,
  setPageTitle,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
