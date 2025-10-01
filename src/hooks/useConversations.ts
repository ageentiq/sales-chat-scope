import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConversationMessage } from '@/data/mockData';
import { ConversationService } from '@/services/conversationService';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  byGroupId: (groupId: string) => [...conversationKeys.all, 'group', groupId] as const,
};

// Get all conversations
export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: () => ConversationService.getAllConversations(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
}

// Get unique conversations (for dashboard)
export function useUniqueConversations() {
  return useQuery({
    queryKey: conversationKeys.list({ type: 'unique' }),
    queryFn: () => ConversationService.getUniqueConversations(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
}

// Get conversations by group ID
export function useConversationsByGroupId(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.byGroupId(conversationId),
    queryFn: () => ConversationService.getConversationsByGroupId(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
}

// Create conversation message mutation
export function useCreateConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: Omit<ConversationMessage, '_id'>) =>
      ConversationService.createConversationMessage(message),
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list({ type: 'unique' }) });
    },
  });
}

// Update conversation message mutation
export function useUpdateConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ConversationMessage> }) =>
      ConversationService.updateConversationMessage(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list({ type: 'unique' }) });
      
      // Update specific conversation group if we have the conversation_id
      if (data?.conversation_id) {
        queryClient.invalidateQueries({ 
          queryKey: conversationKeys.byGroupId(data.conversation_id) 
        });
      }
    },
  });
}

// Delete conversation message mutation
export function useDeleteConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ConversationService.deleteConversationMessage(id),
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list({ type: 'unique' }) });
    },
  });
}

// Get data mode (mock vs MongoDB)
export function useDataMode() {
  return ConversationService.getDataMode();
}
