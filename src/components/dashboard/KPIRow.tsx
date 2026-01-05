import { ReactNode } from "react";

interface KPIRowProps {
  children: ReactNode;
}

export const KPIRow = ({ children }: KPIRowProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {children}
    </div>
  );
};
