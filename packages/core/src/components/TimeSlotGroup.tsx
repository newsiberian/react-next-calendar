import type { ReactElement } from 'react';
import clsx from 'clsx';

import { useGetters } from '../model/gettersContext';
import { NoopWrapper } from './NoopWrapper';

export type TimeSlotGroupProps = {
  group: Date[];
  resourceId?: string | number;
  renderSlot?: (date: Date, idx: number) => ReactElement | null;
  components?: Partial<Pick<Components, 'timeSlotWrapper'>>;
};

export function TimeSlotGroup({
  group,
  resourceId,
  renderSlot,
  components: { timeSlotWrapper: Wrapper = NoopWrapper as Component } = {},
}: TimeSlotGroupProps) {
  const getters = useGetters();
  const groupProps = getters.slotGroupProp();

  return (
    <div className="rbc-timeslot-group" {...groupProps}>
      {group.map((date, idx) => {
        const slotProps = getters.slotProp(date, resourceId);
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
