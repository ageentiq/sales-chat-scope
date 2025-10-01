import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background py-8 pl-8 pr-8">
      <div className="max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">{t('messages')}</h1>
        </div>

        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            {t('messagesComingSoon')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
