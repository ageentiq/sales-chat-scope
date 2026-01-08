import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CustomerAnalysis = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const analysisType = searchParams.get("type") || "createProspect";
  
  const analysisConfig: Record<string, { label: string; labelAr: string; color: string; description: string; descriptionAr: string }> = {
    createProspect: {
      label: "Create Prospect",
      labelAr: "إنشاء صفقة",
      color: "bg-green-500",
      description: "Customers who have shown strong interest and are ready to be converted into prospects.",
      descriptionAr: "العملاء الذين أبدوا اهتمامًا قويًا ومستعدون للتحويل إلى عملاء محتملين."
    },
    futureInterest: {
      label: "Future Interest",
      labelAr: "مهتم بالمراحل القادمة",
      color: "bg-yellow-500",
      description: "Customers who expressed interest in future projects or phases.",
      descriptionAr: "العملاء الذين أبدوا اهتمامًا بالمشاريع أو المراحل المستقبلية."
    },
    notInterested: {
      label: "Not Interested",
      labelAr: "غير مهتم",
      color: "bg-gray-400",
      description: "Customers who indicated they are not interested at this time.",
      descriptionAr: "العملاء الذين أشاروا إلى أنهم غير مهتمين في الوقت الحالي."
    },
    noResponse: {
      label: "No Response",
      labelAr: "لم يتم الرد",
      color: "bg-red-400",
      description: "Customers who have not responded to outreach attempts.",
      descriptionAr: "العملاء الذين لم يستجيبوا لمحاولات التواصل."
    }
  };

  const config = analysisConfig[analysisType] || analysisConfig.createProspect;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'ar' ? 'العودة' : 'Back'}
        </Button>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {language === 'ar' ? config.labelAr : config.label}
          </h1>
        </div>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            {language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {language === 'ar' ? config.descriptionAr : config.description}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            {language === 'ar' ? 'قائمة العملاء' : 'Customer List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            {language === 'ar' 
              ? 'ستظهر بيانات العملاء التفصيلية هنا.' 
              : 'Detailed customer data will be displayed here.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalysis;
