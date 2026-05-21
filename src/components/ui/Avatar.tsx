import { cn } from "@/lib/cn";
import type { AvatarData } from "@/data/types";

const colorMap: Record<string, string> = {
  c1: "bg-[#e8f5f0] text-[#026149]",
  c2: "bg-[#e8ecf8] text-[#1b3f8a]",
  c3: "bg-[#f5e8f0] text-[#6b1b8a]",
  c4: "bg-[#f8ece8] text-[#8a3b1b]",
  c5: "bg-[#f0f5e8] text-[#4a6b1b]",
  c6: "bg-[#e8f0f8] text-[#1b5a8a]",
  c7: "bg-[#f5f0e8] text-[#8a6b1b]",
  c8: "bg-[#f0e8f5] text-[#5a1b8a]",
};

interface AvatarProps {
  user: { avatar?: AvatarData; first?: string; last?: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-7 text-[11px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

export function Avatar({ user, size = "md", className }: AvatarProps) {
  const initials =
    user.avatar?.initials ??
    `${user.first?.[0] ?? "?"}${user.last?.[0] ?? ""}`;
  const colorClass = colorMap[user.avatar?.color ?? "c1"] ?? colorMap.c1;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none",
        sizeMap[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
