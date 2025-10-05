import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function addSampleData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DATABASE);
  const collection = db.collection(process.env.MONGODB_CONVERSATIONS_COLLECTION);
  
  const sampleData = [
    {
      conversation_id: '966544119823',
      inbound: 'سلام عليكم، أريد معلومات عن منتجاتكم الجديدة',
      outbound: 'وعليكم السلام ورحمة الله وبركاته، مرحبا بك! يسعدنا خدمتك. لدينا مجموعة رائعة من المنتجات الجديدة هذا الموسم.',
      media: null,
      timestamp: '2025-09-11T14:09:00.000Z'
    },
    {
      conversation_id: '966544119823',
      inbound: 'هل يمكن أن تعطيني تفاصيل الأسعار؟',
      outbound: 'بالطبع! الأسعار تبدأ من 299 ريال للمنتج الأساسي، و 499 ريال للإصدار المتقدم. نقدم أيضا خصومات للطلبات الكبيرة.',
      media: null,
      timestamp: '2025-09-11T14:12:00.000Z'
    },
    {
      conversation_id: '966544119824',
      inbound: 'Hello, I am interested in your premium package',
      outbound: 'Hi there! Thanks for your interest. Our premium package includes advanced features and priority support. Would you like me to schedule a demo?',
      media: null,
      timestamp: '2025-09-11T13:45:00.000Z'
    },
    {
      conversation_id: '966544119824',
      inbound: 'Yes, that would be great. What times are available?',
      outbound: 'Perfect! I can schedule you for tomorrow at 2 PM or 4 PM. Which works better for you?',
      media: null,
      timestamp: '2025-09-11T13:47:00.000Z'
    },
    {
      conversation_id: '966544119825',
      inbound: 'I need technical support for my recent order',
      outbound: 'I would be happy to help with technical support. Could you please provide your order number so I can look up the details?',
      media: null,
      timestamp: '2025-09-11T12:30:00.000Z'
    },
    {
      conversation_id: '966544119826',
      inbound: 'متى سيصل الطلب؟',
      outbound: 'شكراً لسؤالك! الطلب في طريقه إليك ومن المتوقع وصوله خلال 2-3 أيام عمل. سأرسل لك رقم التتبع قريباً.',
      media: null,
      timestamp: '2025-09-11T09:45:00.000Z'
    },
    {
      conversation_id: '966544119827',
      inbound: 'Can I get a refund for my purchase?',
      outbound: 'I understand you would like to request a refund. Let me check your purchase details and our refund policy. Could you provide your order reference?',
      media: null,
      timestamp: '2025-09-11T10:20:00.000Z'
    }
  ];
  
  console.log('Adding sample data to MongoDB...');
  console.log('Database:', process.env.MONGODB_DATABASE);
  console.log('Collection:', process.env.MONGODB_CONVERSATIONS_COLLECTION);
  
  const result = await collection.insertMany(sampleData);
  console.log('Added', result.insertedCount, 'documents');
  
  const count = await collection.countDocuments();
  console.log('Total documents in collection:', count);
  
  // Show a sample document
  const sample = await collection.findOne();
  console.log('Sample document:', JSON.stringify(sample, null, 2));
  
  await client.close();
}

addSampleData().catch(console.error);
