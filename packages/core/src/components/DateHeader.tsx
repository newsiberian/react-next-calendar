import type { MouseEvent } from 'react';

type DateHeaderProps = {
  date: Date;
  label: string;
  drillDownView: View | null;
  isOffRange: boolean;
  onDrillDown: (e: MouseEvent) => void;
};

export function DateHeader({
  label,
  drillDownView,
  onDrillDown,
}: DateHeaderProps) {
  if (!drillDownView) {
    // TODO: cursor mustn't be 'pointer' here
    return <span>{label}</span>;
  }

  return (
    <span role="link" onClick={onDrillDown}>
      {label}
    </span>
  );
}
