declare module "@/components/ui/alert" {
  import * as React from "react";
  
  export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive" | "warning" | "info" | "success";
  }
  
  export const Alert: React.ForwardRefExoticComponent<
    AlertProps & React.RefAttributes<HTMLDivElement>
  >;
  
  export const AlertTitle: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>
  >;
  
  export const AlertDescription: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
  >;
} 