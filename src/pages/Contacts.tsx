import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users } from "lucide-react";

const Contacts = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background py-8 pl-8 pr-8">
      <div className="max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">{t('contacts')}</h1>
        </div>

        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            {t('comingSoon')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
