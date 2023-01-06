import type { MouseEvent } from 'react';

interface DateHeaderProps {
  date: Date;
  label: string;
  drillDownView: View | null;
  isOffRange: boolean;
  onDrillDown: (e: MouseEvent) => void;
}

function DateHeader({ label, drillDownView, onDrillDown }: DateHeaderProps) {
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

export default DateHeader;
