import { type Conversation } from '../types';

const STORAGE_KEY = 'lexilaw_conversations';

export const getConversations = (): Conversation[] => {
  try {
    const conversationsJson = localStorage.getItem(STORAGE_KEY);
    return conversationsJson ? JSON.parse(conversationsJson) : [];
  } catch (error) {
    console.error("Failed to parse conversations from localStorage", error);
    return [];
  }
};

export const getConversationById = (id: string): Conversation | undefined => {
    const conversations = getConversations();
    return conversations.find(c => c.id === id);
}

export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);

  if (existingIndex > -1) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
};

export const deleteConversation = (id: string): void => {
  let conversations = getConversations();
  conversations = conversations.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
};
