import { ConversationMessage } from '@/data/mockData';
import { getMessageTimeMs } from './timestamps';

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').split('.')[0];
}

export function exportConversations(
  conversations: ConversationMessage[],
  filename: string = 'conversations.csv'
) {
  const headers = ['Conversation ID', 'Timestamp', 'Inbound', 'Outbound', 'Status'];
  const rows = conversations.map(conv => {
    const ms = getMessageTimeMs(conv);
    return [
      conv.conversation_id || '',
      formatDateTime(ms),
      (conv.inbound || '').replace(/[\n\r,]/g, ' '),
      (conv.outbound || '').replace(/[\n\r,]/g, ' '),
      (conv as any).latestStatus || ''
    ].map(v => `"${v}"`).join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, filename);
}

export function exportMessages(
  messages: ConversationMessage[],
  filename: string = 'messages.csv'
) {
  const headers = ['Conversation ID', 'Message ID', 'Timestamp', 'Direction', 'Content', 'Status'];
  const rows = messages.map(msg => {
    const ms = getMessageTimeMs(msg);
    const direction = msg.inbound ? 'Inbound' : 'Outbound';
    const content = msg.inbound || msg.outbound || '';
    return [
      msg.conversation_id || '',
      msg.message_id || '',
      formatDateTime(ms),
      direction,
      content.replace(/[\n\r,]/g, ' '),
      (msg as any).latestStatus || ''
    ].map(v => `"${v}"`).join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, filename);
}

export function exportSummaryStats(
  stats: Record<string, string | number>,
  filename: string = 'stats.csv'
) {
  const headers = ['Metric', 'Value'];
  const rows = Object.entries(stats).map(([key, value]) => {
    return [`"${key}"`, `"${value}"`].join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, filename);
}

export function exportMessageStatus(
  messages: ConversationMessage[],
  filename: string = 'message_status.csv'
) {
  const headers = ['Conversation ID', 'Message ID', 'Timestamp', 'Status', 'Content'];
  const rows = messages
    .filter(msg => msg.outbound && (msg as any).latestStatus)
    .map(msg => {
      const ms = getMessageTimeMs(msg);
      return [
        msg.conversation_id || '',
        msg.message_id || '',
        formatDateTime(ms),
        (msg as any).latestStatus || '',
        (msg.outbound || '').replace(/[\n\r,]/g, ' ')
      ].map(v => `"${v}"`).join(',');
    });
  
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(csv, filename);
}
