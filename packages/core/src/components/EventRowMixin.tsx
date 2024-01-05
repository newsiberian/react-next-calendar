import type { ReactNode } from 'react';
import { isSelected } from '@react-next-calendar/utils';

import { EventCell, EventCellProps } from './EventCell';

export type EventProps = Omit<
  EventCellProps,
  | 'event'
  | 'selected'
  | 'slotStart'
  | 'slotEnd'
  | 'continuesPrior'
  | 'continuesAfter'
> & {
  selected?: RNC.Event;
  slotMetrics: DateSlotMetrics;
};

export function renderEvent(
  {
    selected,
    components,
    getters,
    localizer,
    onSelect,
    onDoubleClick,
    onKeyPress,
    slotMetrics,
  }: EventProps,
  event: RNC.Event,
) {
  const continuesPrior = slotMetrics.continuesPrior(event);
  const continuesAfter = slotMetrics.continuesAfter(event);

  return (
    <EventCell
      event={event}
      getters={getters}
      localizer={localizer}
      components={components}
      onSelect={onSelect}
      onDoubleClick={onDoubleClick}
      onKeyPress={onKeyPress}
      continuesPrior={continuesPrior}
      continuesAfter={continuesAfter}
      slotStart={slotMetrics.first}
      slotEnd={slotMetrics.last}
      selected={isSelected(event, selected)}
    />
  );
}

export function renderSpan(
  slots: number,
  len: number,
  key: string,
  content: ReactNode | string = ' ',
) {
  const per = (Math.abs(len) / slots) * 100 + '%';

  return (
    <div
      key={key}
      className="rbc-row-segment"
      // IE10/11 need max-width. flex-basis doesn't respect box-sizing
      style={{ WebkitFlexBasis: per, flexBasis: per, maxWidth: per }}
    >
      {content}
    </div>
  );
}
