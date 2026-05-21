interface PlaceholderViewProps {
  name: string;
}

export function PlaceholderView({ name }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-ink-4)]">
      <div className="text-4xl">🚧</div>
      <p className="text-[15px] font-medium text-[var(--color-ink-3)]">
        {name}
      </p>
      <p className="text-[13px]">Vista en migración</p>
    </div>
  );
}
