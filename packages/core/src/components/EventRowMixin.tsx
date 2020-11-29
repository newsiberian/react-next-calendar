import * as React from 'react';
import { isSelected } from '@react-next-calendar/utils';

import EventCell from './EventCell';

export interface EventProps {
  selected?: RNC.Event;

  accessors: Accessors;
  components: Components;
  getters: Getters;
  localizer: Localizer;

  onSelect?: (event: RNC.Event, e: React.MouseEvent) => void;
  onDoubleClick?: (event: RNC.Event, e: React.MouseEvent) => void;
  onKeyPress?: (event: RNC.Event, e: React.KeyboardEvent) => void;

  slotMetrics: DateSlotMetrics;
}

export function renderEvent(
  {
    selected,
    accessors,
    components,
    getters,
    localizer,
    onSelect,
    onDoubleClick,
    onKeyPress,
    slotMetrics,
  }: EventProps,
  event: RNC.Event,
): React.ReactElement {
  const continuesPrior = slotMetrics.continuesPrior(event);
  const continuesAfter = slotMetrics.continuesAfter(event);

  return (
    <EventCell
      event={event}
      getters={getters}
      localizer={localizer}
      accessors={accessors}
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
  content: React.ReactNode | string = ' ',
): React.ReactElement {
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
