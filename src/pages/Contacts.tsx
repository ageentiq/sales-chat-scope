import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Search, Phone, Mail, Clock, UserCircle2, MessageCircle } from "lucide-react";
import { useUniqueConversations } from "@/hooks/useConversations";

// Skeleton loader for contact items
const ContactSkeleton = () => (
  <div className="p-5 space-y-3 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-4 w-40 ml-15" />
  </div>
);

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
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // Less than 7 days
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <UserCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('contacts')}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">{t('manageYourCustomerContacts')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="h-full bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {t('allContacts')}
                  </span>
                </CardTitle>
                {!isLoading && contacts.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
                    {filteredContacts.length} {filteredContacts.length === 1 ? t('contact') : t('contacts')}
                  </Badge>
                )}
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="space-y-0">
                    {[...Array(5)].map((_, i) => (
                      <ContactSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredContacts.map((contact, index) => (
                      <div
                        key={contact.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="group relative p-5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left-4"
                      >
                        {/* Hover indicator */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white">
                              <UserCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base group-hover:text-primary transition-colors">{contact.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="font-mono text-xs">{contact.phone.substring(0, 12)}...</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs px-2.5 py-1 font-semibold bg-primary/10 text-primary border-primary/20">
                            <MessageCircle className="h-3 w-3 mr-1 inline" />
                            {contact.messageCount}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-15 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{t('lastContact')}:</span>
                          <span>{formatTimestamp(contact.lastContact)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isLoading && filteredContacts.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? t('noMatchesFound') : t('noContactsYet')}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {searchTerm 
                        ? t('tryAdjustingSearch') 
                        : t('startConversationToSeeContacts')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contacts;
