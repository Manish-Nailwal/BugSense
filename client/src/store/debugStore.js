import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useDebugStore = create((set, get) => ({
  errorInput: '',
  isStreaming: false,
  streamedResponse: '',
  messages: [], // Array of { role: 'user' | 'assistant', content: string }
  currentSection: 'breakdown',
  pastSessions: [],
  sessionId: null,
  metadata: null,
  error: null,
  isConfirmModalOpen: false,
  selectedModel: localStorage.getItem('lastModel') || 'Gemini 2.5 Flash',
  quotaCounts: { 'Gemini 3 Flash': 0, 'Gemini 2.5 Flash': 0 },

  setErrorInput: (val) => set({ errorInput: val }),
  setConfirmModalOpen: (isOpen) => set({ isConfirmModalOpen: isOpen }),
  setSelectedModel: (model) => {
    localStorage.setItem('lastModel', model);
    set({ selectedModel: model });
  },

  fetchQuota: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/debug/quota`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) set({ quotaCounts: data.data });
    } catch (err) {
      console.error('Failed to fetch quota:', err);
    }
  },

  fetchSessions: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/debug/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) set({ pastSessions: data.data });
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  },

  loadSession: async (id) => {
    const token = localStorage.getItem('token');
    // We shouldn't use isStreaming for loading a past record as it disables the UI in the wrong way
    set({ error: null });
    try {
      const response = await fetch(`${API_URL}/api/debug/sessions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
        const session = data.data;
        
        // Handle legacy sessions that don't have the 'messages' array yet
        const displayMessages = session.messages && session.messages.length > 0 
          ? session.messages 
          : [
              { role: 'user', content: session.rawError },
              { role: 'assistant', content: session.aiResponse.fullText }
            ];

        set({
          sessionId: session._id,
          errorInput: session.rawError,
          messages: displayMessages
        });
    } catch (err) {
      set({ error: err.message });
    }
  },

  resetSession: () => set({ 
    errorInput: '', 
    streamedResponse: '', 
    messages: [],
    sessionId: null, 
    metadata: null, 
    error: null 
  }),

  startAnalysis: async () => {
    const { errorInput, fetchSessions } = get();
    const token = localStorage.getItem('token');

    if (!errorInput.trim()) return;

    set({ 
      isStreaming: true, 
      streamedResponse: '', 
      messages: [{ role: 'user', content: errorInput }],
      error: null, 
      metadata: null,
      sessionId: null 
    });

    try {
      const { selectedModel } = get();
      const response = await fetch(`${API_URL}/api/debug/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          errorLog: errorInput,
          selectedModel 
        })
      });

      if (!response.ok) throw new Error('Failed to start analysis');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              
              if (data.metadata?.sessionId) {
                set({ sessionId: data.metadata.sessionId });
              }

              if (data.chunk) {
                fullText += data.chunk;
                set({ streamedResponse: fullText });
              }

              if (data.done) {
                set((state) => ({
                  isStreaming: false,
                  metadata: data.metadata,
                  sessionId: data.metadata?.sessionId,
                  messages: [...state.messages, { role: 'assistant', content: fullText }],
                  streamedResponse: '' 
                }));
                // Refresh sidebar history and quota
                fetchSessions();
                get().fetchQuota();
              }

              if (data.error) {
                set({ error: data.message, isStreaming: false });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      set({ error: err.message, isStreaming: false });
    }
  },


  sendFollowUp: async (content) => {
    const { messages, sessionId } = get();
    const token = localStorage.getItem('token');

    set((state) => ({
      isStreaming: true,
      streamedResponse: '',
      messages: [...state.messages, { role: 'user', content }],
      error: null
    }));

    try {
      const { selectedModel } = get();
      // For now, we use the same prompt engineering but include history
      // Note: Ideally the server handles the history context
      const response = await fetch(`${API_URL}/api/debug/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          errorLog: content, 
          history: messages, // Send history for context
          sessionId,
          selectedModel 
        })
      });

      if (!response.ok) throw new Error('Failed to send follow-up');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.chunk) {
                fullText += data.chunk;
                set({ streamedResponse: fullText });
              }
                  if (data.done) {
                    set((state) => ({
                      isStreaming: false,
                      messages: [...state.messages, { role: 'assistant', content: fullText }],
                      streamedResponse: ''
                    }));
                    get().fetchQuota();
                  }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      set({ error: err.message, isStreaming: false });
    }
  },

  renameSession: async (id, newTitle) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/debug/sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          pastSessions: state.pastSessions.map(s => s._id === id ? { ...s, title: newTitle } : s)
        }));
      }
    } catch (err) {
      console.error('Failed to rename session:', err);
    }
  },

  deleteSession: async (id) => {
    const token = localStorage.getItem('token');
    const { sessionId, resetSession } = get();
    try {
      const response = await fetch(`${API_URL}/api/debug/sessions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          pastSessions: state.pastSessions.filter(s => s._id !== id)
        }));
        if (sessionId === id) {
          resetSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  },

  retryAnalysis: async () => {
    const { messages, sessionId, startAnalysis, sendFollowUp } = get();
    if (messages.length === 0) return;

    // The last message is the one that failed (user message)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role !== 'user') return;

    // Remove the failed turn from history to let the methods re-add it correctly
    set((state) => ({
      messages: state.messages.slice(0, -1),
      error: null
    }));

    if (!sessionId) {
      // It was the initial analysis. Restore errorInput first.
      set({ errorInput: lastUserMessage.content });
      await startAnalysis();
    } else {
      // It was a follow-up
      await sendFollowUp(lastUserMessage.content);
    }
  },

  confirmFix: async (sessionId, userNote, shouldPublish) => {
    const token = localStorage.getItem('token');
    const { selectedModel, fetchSessions, fetchQuota } = get();
    try {
      const response = await fetch(`${API_URL}/api/debug/sessions/${sessionId}/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userNote, shouldPublish, selectedModel })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      
      // Refresh to update fixed status and potentially quota
      await fetchSessions();
      if (shouldPublish) await fetchQuota();
      
      return data.data;
    } catch (err) {
      console.error('Failed to confirm fix:', err);
      throw err;
    }
  },

  publishOnly: async (id) => {
    const { confirmFix } = get();
    // Re-use confirmFix with empty note and publish set to true
    return await confirmFix(id, '', true);
  }
}));


export default useDebugStore;
