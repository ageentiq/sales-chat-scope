// MongoDB Sample Data Import Script
// This script helps import sample conversation data into your MongoDB Atlas database

const sampleData = [
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fec8"
    },
    "conversation_id": "966544119823",
    "inbound": "سلام عليكم، أريد معلومات عن منتجاتكم الجديدة",
    "outbound": "وعليكم السلام ورحمة الله وبركاته، مرحبا بك! يسعدنا خدمتك. لدينا مجموعة رائعة من المنتجات الجديدة هذا الموسم.",
    "media": null,
    "timestamp": "2025-09-11 14:09"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fec9"
    },
    "conversation_id": "966544119823", 
    "inbound": "هل يمكن أن تعطيني تفاصيل الأسعار؟",
    "outbound": "بالطبع! الأسعار تبدأ من 299 ريال للمنتج الأساسي، و 499 ريال للإصدار المتقدم. نقدم أيضا خصومات للطلبات الكبيرة.",
    "media": null,
    "timestamp": "2025-09-11 14:12"
  },
  {
    "_id": {
      "$oid": "68c305deea02f24a6ae9fed3"
    },
    "conversation_id": "966544119823",
    "inbound": "ايه مستحق\nراتبي ١٥٠٠٠\nايه نعم",
    "outbound": "سلمت يا بدر، معلومات وافية.\n\nأبشر يا طويل العمر، بما إنك مستحقمشروع هو عام 2029 بإذن الله.\n\nهل الشقق هذي تناسب اهتماماتك يا بدر؟",
    "media": null,
    "timestamp": "2025-09-11 20:09"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fed0"
    },
    "conversation_id": "966544119824",
    "inbound": "Hello, I'm interested in your premium package",
    "outbound": "Hi there! Thanks for your interest. Our premium package includes advanced features and priority support. Would you like me to schedule a demo?",
    "media": null,
    "timestamp": "2025-09-11 13:45"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fed1"
    }, 
    "conversation_id": "966544119824",
    "inbound": "Yes, that would be great. What times are available?",
    "outbound": "Perfect! I can schedule you for tomorrow at 2 PM or 4 PM. Which works better for you?",
    "media": null,
    "timestamp": "2025-09-11 13:47"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fed2"
    },
    "conversation_id": "966544119825", 
    "inbound": "I need technical support for my recent order",
    "outbound": "I'd be happy to help with technical support. Could you please provide your order number so I can look up the details?",
    "media": null,
    "timestamp": "2025-09-11 12:30"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fed4"
    },
    "conversation_id": "966544119827",
    "inbound": "Can I get a refund for my purchase?", 
    "outbound": "I understand you'd like to request a refund. Let me check your purchase details and our refund policy. Could you provide your order reference?",
    "media": null,
    "timestamp": "2025-09-11 10:20"
  },
  {
    "_id": {
      "$oid": "68c2b0faea02f24a6ae9fed5"
    },
    "conversation_id": "966544119828",
    "inbound": "متى سيصل الطلب؟",
    "outbound": "شكراً لسؤالك! الطلب في طريقه إليك ومن المتوقع وصوله خلال 2-3 أيام عمل. سأرسل لك رقم التتبع قريباً.",
    "media": null,
    "timestamp": "2025-09-11 09:45"
  }
];

console.log('Sample conversation data for MongoDB Atlas import:');
console.log('================================================');
console.log(JSON.stringify(sampleData, null, 2));

console.log('\n\nTo import this data into your MongoDB Atlas database:');
console.log('1. Copy the JSON data above');
console.log('2. Go to your MongoDB Atlas dashboard');
console.log('3. Navigate to your database and collection');
console.log('4. Click "Insert Document" and paste the JSON');
console.log('5. Or use MongoDB Compass to import the data');

console.log('\n\nAlternatively, you can use the MongoDB shell:');
console.log('db.conversations.insertMany(' + JSON.stringify(sampleData) + ')');
