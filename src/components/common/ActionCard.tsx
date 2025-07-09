
import React, { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  to: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  to,
  variant = "default",
  className
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardFooter className="pt-2">
        <Button variant={variant} className="w-full" asChild>
          <Link to={to}>Acceder</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActionCard;
