import * as React from 'react';
import range from 'lodash/range';

import { eventLevels } from '../utils/eventLevels';
import { renderEvent, renderSpan, EventProps } from './EventRowMixin';

interface EventEndingRowProps extends EventProps {
  segments?: Segment[];
  onShowMore: (slot: number, target: EventTarget) => void;
}

const isSegmentInSlot = (seg: Segment, slot: number): boolean =>
  seg.left <= slot && seg.right >= slot;

const eventsInSlot = (segments: Segment[], slot: number): number =>
  segments.filter(seg => isSegmentInSlot(seg, slot)).length;

function EventEndingRow({
  segments = [],
  onShowMore,
  ...props
}: EventEndingRowProps): React.ReactElement {
  function canRenderSlotEvent(slot: number, span: number): boolean {
    return range(slot, slot + span).every((s: number) => {
      const count = eventsInSlot(segments, s);
      return count === 1;
    });
  }

  function renderShowMore(segments: Segment[], slot: number): React.ReactNode {
    const count = eventsInSlot(segments, slot);
    return count ? (
      <a
        key={'sm_' + slot}
        href="#"
        className="rbc-show-more"
        onClick={e => showMore(slot, e)}
      >
        {props.localizer.messages.showMore(count)}
      </a>
    ) : null;
  }

  function showMore(slot: number, e: React.MouseEvent): void {
    e.preventDefault();
    onShowMore(slot, e.target);
  }

  const rowSegments = eventLevels(segments).levels[0];

  let current = 1;
  let lastEnd = 1;
  const row = [];

  while (current <= props.slotMetrics.slots) {
    const key = '_lvl_' + current;

    const { event, left, right, span } =
      rowSegments.filter(seg => isSegmentInSlot(seg, current))[0] || {};

    if (!event) {
      current++;
      continue;
    }

    const gap = Math.max(0, left - lastEnd);

    if (canRenderSlotEvent(left, span)) {
      const content = renderEvent(props, event);

      if (gap) {
        row.push(renderSpan(props.slotMetrics.slots, gap, key + '_gap'));
      }

      row.push(renderSpan(props.slotMetrics.slots, span, key, content));

      lastEnd = current = right + 1;
    } else {
      if (gap) {
        row.push(renderSpan(props.slotMetrics.slots, gap, key + '_gap'));
      }

      row.push(
        renderSpan(
          props.slotMetrics.slots,
          1,
          key,
          renderShowMore(segments, current),
        ),
      );
      lastEnd = current = current + 1;
    }
  }

  return <div className="rbc-row">{row}</div>;
}

export default EventEndingRow;
