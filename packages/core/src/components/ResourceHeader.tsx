import * as React from 'react';

export interface ResourceHeaderProps {
  index: number;
  label: React.ReactNode;
  resource: Resource;
}

export default function ResourceHeader({ label }: ResourceHeaderProps) {
  return <>{label}</>;
}
