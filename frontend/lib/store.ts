import { create } from 'zustand';
import { Session, Contact, Message } from './api';

interface AppState {
  // Auth
  user: any | null;
  setUser: (user: any | null) => void;

  // Sessions
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  removeSession: (sessionId: string) => void;

  // Current session
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;

  // Contacts
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;

  // Current chat
  currentChat: Contact | null;
  setCurrentChat: (chat: Contact | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    })),
  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  // Current session
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),

  // Current chat
  currentChat: null,
  setCurrentChat: (chat) => set({ currentChat: chat }),

  // Messages
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

