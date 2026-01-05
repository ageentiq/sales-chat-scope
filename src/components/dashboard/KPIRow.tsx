import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface KPIRowProps {
  children: ReactNode;
  title?: string;
  titleAr?: string;
}

export const KPIRow = ({ children, title, titleAr }: KPIRowProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-3">
      {title && (
        <h2 className="text-base md:text-lg font-semibold text-gray-700">
          {language === 'ar' ? titleAr : title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {children}
      </div>
    </div>
  );
};
