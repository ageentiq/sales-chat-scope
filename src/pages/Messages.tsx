import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">الرسائل</h1>
        </div>

        <Card className="p-8">
          <p className="text-muted-foreground text-center">
            قريبًا - صفحة الرسائل قيد التطوير
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
