"use client";

import { forwardRef } from "react";
import { User } from "lucide-react";
import { cn, getInitials } from "@/shared/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", status, ...props }, ref) => {
    const sizes = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5",
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
      xl: "w-4 h-4",
    };

    const statusColors = {
      online: "bg-lime-500",
      offline: "bg-gray-500",
      busy: "bg-red-500",
      away: "bg-yellow-500",
    };

    const initials = name ? getInitials(name) : null;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        {...props}
      >
        <div
          className={cn(
            "flex items-center justify-center clip-notch-sm bg-gray-800 text-gray-300 font-mono font-medium overflow-hidden border border-gray-700",
            sizes[size],
          )}
        >
          {src ? (
            <img
              src={src}
              alt={alt || name || "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : initials ? (
            <span className="uppercase">{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </div>
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block ring-2 ring-gray-900",
              statusSizes[size],
              statusColors[status],
            )}
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export { Avatar };
