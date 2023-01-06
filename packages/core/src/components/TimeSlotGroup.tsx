import type { ReactElement } from 'react';
import clsx from 'clsx';

import { NoopWrapper } from './NoopWrapper';

type SlotGetters = Pick<Getters, 'slotGroupProp' | 'slotProp'>;

export interface TimeSlotGroupProps {
  group: Date[];
  resourceId?: string | number;
  renderSlot?: (date: Date, idx: number) => ReactElement | null;
  getters: SlotGetters;
  components?: Partial<Pick<Components, 'timeSlotWrapper'>>;
}

export default function TimeSlotGroup({
  group,
  resourceId,
  renderSlot,
  getters,
  components: { timeSlotWrapper: Wrapper = NoopWrapper as Component } = {},
}: TimeSlotGroupProps) {
  const groupProps = getters ? getters.slotGroupProp() : {};
  return (
    <div className="rbc-timeslot-group" {...groupProps}>
      {group.map((date, idx) => {
        const slotProps = getters ? getters.slotProp(date, resourceId) : {};
        return (
          <Wrapper key={idx} value={date} resource={resourceId}>
            <div
              {...slotProps}
              className={clsx('rbc-time-slot', slotProps.className)}
            >
              {renderSlot && renderSlot(date, idx)}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
