export interface ConversationMessage {
  _id: string;
  conversation_id: string;
  inbound: string;
  outbound: string;
  timestamp: string;
}

export const mockConversations: ConversationMessage[] = [
  {
    _id: "68c2b0faea02f24a6ae9fec8",
    conversation_id: "966544119823",
    inbound: "سلام عليكم، أريد معلومات عن منتجاتكم الجديدة",
    outbound: "وعليكم السلام ورحمة الله وبركاته، مرحبا بك! يسعدنا خدمتك. لدينا مجموعة رائعة من المنتجات الجديدة هذا الموسم.",
    timestamp: "2025-09-11 14:09"
  },
  {
    _id: "68c2b0faea02f24a6ae9fec9",
    conversation_id: "966544119823", 
    inbound: "هل يمكن أن تعطيني تفاصيل الأسعار؟",
    outbound: "بالطبع! الأسعار تبدأ من 299 ريال للمنتج الأساسي، و 499 ريال للإصدار المتقدم. نقدم أيضا خصومات للطلبات الكبيرة.",
    timestamp: "2025-09-11 14:12"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed0",
    conversation_id: "966544119824",
    inbound: "Hello, I'm interested in your premium package",
    outbound: "Hi there! Thanks for your interest. Our premium package includes advanced features and priority support. Would you like me to schedule a demo?",
    timestamp: "2025-09-11 13:45"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed1", 
    conversation_id: "966544119824",
    inbound: "Yes, that would be great. What times are available?",
    outbound: "Perfect! I can schedule you for tomorrow at 2 PM or 4 PM. Which works better for you?",
    timestamp: "2025-09-11 13:47"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed2",
    conversation_id: "966544119825", 
    inbound: "I need technical support for my recent order",
    outbound: "I'd be happy to help with technical support. Could you please provide your order number so I can look up the details?",
    timestamp: "2025-09-11 12:30"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed3",
    conversation_id: "966544119826",
    inbound: "أهلاً، أواجه مشكلة في الدفع",
    outbound: "أهلاً وسهلاً! أعتذر عن المشكلة. دعني أساعدك في حل مشكلة الدفع. ما هو نوع الخطأ الذي تواجهه؟",
    timestamp: "2025-09-11 11:15"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed4",
    conversation_id: "966544119827",
    inbound: "Can I get a refund for my purchase?", 
    outbound: "I understand you'd like to request a refund. Let me check your purchase details and our refund policy. Could you provide your order reference?",
    timestamp: "2025-09-11 10:20"
  },
  {
    _id: "68c2b0faea02f24a6ae9fed5",
    conversation_id: "966544119828",
    inbound: "متى سيصل الطلب؟",
    outbound: "شكراً لسؤالك! الطلب في طريقه إليك ومن المتوقع وصوله خلال 2-3 أيام عمل. سأرسل لك رقم التتبع قريباً.",
    timestamp: "2025-09-11 09:45"
  }
];

export const getConversationsByGroupId = (conversationId: string): ConversationMessage[] => {
  return mockConversations.filter(conv => conv.conversation_id === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getUniqueConversations = (): ConversationMessage[] => {
  const grouped = mockConversations.reduce((acc, conv) => {
    if (!acc[conv.conversation_id] || new Date(conv.timestamp) > new Date(acc[conv.conversation_id].timestamp)) {
      acc[conv.conversation_id] = conv;
    }
    return acc;
  }, {} as Record<string, ConversationMessage>);
  
  return Object.values(grouped).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};