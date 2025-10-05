import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Search, Phone, Mail, Clock } from "lucide-react";
import { useUniqueConversations } from "@/hooks/useConversations";

const Contacts = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: conversations = [], isLoading } = useUniqueConversations();

  // Extract unique contacts from conversations
  const contacts = conversations.map((conv, index) => ({
    id: conv.conversation_id,
    name: `Customer ${conv.conversation_id.slice(-4)}`,
    phone: conv.conversation_id,
    lastContact: conv.timestamp,
    messageCount: Math.floor(Math.random() * 20) + 1,
  }));

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('contacts')}</h1>
              <p className="text-gray-600 mt-1">Manage your customer contacts</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Contacts
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-600">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Loading contacts...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {contact.messageCount} messages
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 ml-13">
                        <Clock className="h-3 w-3" />
                        Last contact: {formatTimestamp(contact.lastContact)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!isLoading && filteredContacts.length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contacts found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Contacts;
