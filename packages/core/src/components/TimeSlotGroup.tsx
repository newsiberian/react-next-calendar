import * as React from 'react';
import clsx from 'clsx';

import BackgroundWrapper from './BackgroundWrapper';

type SlotGetters = Pick<Getters, 'slotGroupProp' | 'slotProp'>;

export interface TimeSlotGroupProps {
  group: Date[];
  resourceId?: string | number;
  renderSlot: (date: Date, idx: number) => React.ReactElement | null;
  getters: SlotGetters;
  components?: Partial<Components>;
}

export default function TimeSlotGroup({
  group,
  resourceId,
  renderSlot,
  getters,
  components: { timeSlotWrapper: Wrapper = BackgroundWrapper } = {},
}: TimeSlotGroupProps): React.ReactElement {
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
