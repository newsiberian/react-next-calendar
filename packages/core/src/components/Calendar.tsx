import { useMemo, HTMLAttributes, MouseEvent, KeyboardEvent } from 'react';
import { uncontrollable } from 'uncontrollable';
import clsx from 'clsx';

import { CalendarContext } from '../model/calendarContext';
import { GettersContext, GetterResult } from '../model/gettersContext';
import { LocalizerContext } from '../model/localizerContext';
import { PluginsContext } from '../model/pluginsContext';
import { notify, defaults, omit } from '../utils/helpers';
import { NavigateAction, views } from '../utils/constants';
import { applyMessages } from '../utils/messages';
import moveDate from '../utils/move';
import { Localizer, Formats, mergeWithDefaults } from '../localizer';
import VIEWS from './Views';
import { Toolbar } from './Toolbar';
import { NoopWrapper } from './NoopWrapper';

export type CalendarProps = {
  localizer: Localizer;

  /**
   * Props passed to main calendar `<div>`.
   */
  elementProps?: HTMLAttributes<HTMLDivElement>;

  /**
   * The current date value of the calendar. Determines the visible view range.
   * If `date` is omitted then the result of `getNow` is used; otherwise the
   * current date is used.
   *
   * @controllable onNavigate
   */
  date?: Date;

  /**
   * An array of event objects to display on the calendar.
   */
  events: RNC.Event[];

  /**
   * An array of resource objects that map events to a specific resource.
   */
  resources?: Resource[];

  /**
   * The current view of the calendar.
   *
   * @defaultValue 'month'
   * @controllable onView
   */
  view?: View;

  /**
   * The initial view set for the Calendar.
   * @type {View} ('month'|'week'|'work_week'|'day'|'agenda')
   * @defaultValue 'month'
   */
  defaultView?: View;

  /**
   * An array of built-in view names to allow the calendar to display.
   * accepts either an array of builtin view names.
   *
   * ```jsx
   * views={['month', 'day', 'agenda']}
   * ```
   * or an object hash of the view name and the component (or boolean for
   * builtin).
   *
   * ```jsx
   * views={{
   *   month: true,
   *   week: false,
   *   myweek: WorkWeekViewComponent,
   * }}
   * ```
   *
   * Custom views can be any React component, that implements the following
   * interface:
   *
   * ```ts
   * interface View {
   *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
   *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
   * }
   * ```
   *
   * @type Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @View ['month', 'week', 'day', 'agenda']
   */
  views?: View[] | CustomViews;

  /**
   * Determines the current date/time which is highlighted in the views.
   *
   * The value affects which day is shaded and which time is shown as
   * the current time. It also affects the date used by the Today button in
   * the toolbar.
   *
   * @type {func}
   * @default () => new Date()
   */
  getNow?: GetNow;

  /**
   * Callback fired when the `date` value changes.
   *
   * @controllable date
   */
  onNavigate: (nextDate: Date, view: View, action: Action) => void;

  /**
   * Callback fired when the `view` value changes.
   *
   * @controllable view
   */
  onView: (view: View) => void;

  /**
   * Callback fired when date header, or the truncated events links are clicked
   *
   */
  onDrillDown?: (date: Date, view: View, drilldownView?: View) => void;

  /**
   *
   * ```js
   * (dates: Date[] | { start: Date; end: Date }, view?: 'month'|'week'|'work_week'|'day'|'agenda') => void
   * ```
   *
   * Callback fired when the visible date range changes. Returns an Array of
   * dates or an object with start and end dates for BUILTIN views. Optionally
   * new `view` will be returned when callback called after view change.
   *
   * Custom views may return something different.
   */
  onRangeChange?: (
    range: Date[] | { start: Date; end: Date },
    view?: View,
  ) => void;

  /**
   * A callback fired when a date selection is made. Only fires when `selectable`
   * is `true`.
   *
   * ```ts
   * (
   *   slotInfo: {
   *     start: Date,
   *     end: Date,
   *     resourceId:  (number|string),
   *     slots: Array<Date>,
   *     action: "select" | "click" | "doubleClick",
   *     // For "select" action
   *     bounds?: {
   *       x: number,
   *       y: number,
   *       top: number,
   *       right: number,
   *       left: number,
   *       bottom: number,
   *     },
   *     // For "click" or "doubleClick" actions
   *     box?: {
   *       clientX: number,
   *       clientY: number,
   *       x: number,
   *       y: number,
   *     },
   *   }
   * ) => void
   * ```
   */
  onSelectSlot?: (slotInfo: SlotInfo) => void;

  /**
   * Callback fired when a calendar event is selected.
   *
   * ```js
   * (event: Event, e: MouseEvent) => void
   * ```
   *
   * @controllable selected
   */
  onSelectEvent?: (event: RNC.Event, e: MouseEvent) => void;

  /**
   * Callback fired when a calendar event is clicked twice.
   *
   * ```js
   * (event: Event, e: MouseEvent) => void
   * ```
   */
  onDoubleClickEvent?: (event: RNC.Event, e: MouseEvent) => void;

  /**
   * Callback fired when a focused calendar event receives a key press.
   *
   * ```js
   * (event: Event, e: KeyboardEvent) => void
   * ```
   */
  onKeyPressEvent?: (event: RNC.Event, e: KeyboardEvent) => void;

  /**
   * Callback fired when dragging a selection in the Time views.
   *
   * Returning `false` from the handler will prevent a selection.
   *
   * ```js
   * (range: { start: Date, end: Date, resourceId: (number|string) }) => ?boolean
   * ```
   */
  onSelecting?: OnSelecting;

  /**
   * Callback fired when a +{count} more is clicked
   *
   * ```js
   * (events: Object, date: Date) => any
   * ```
   */
  onShowMore?: (events: RNC.Event[], date: Date, slot: number) => void;

  /**
   * The selected event, if any.
   */
  selected?: RNC.Event;

  /**
   * The string name of the destination view for drill-down actions, such
   * as clicking a date header, or the truncated events links. If
   * `getDrilldownView` is also specified it will be used instead.
   *
   * Set to `null` to disable drill-down actions.
   *
   * ```js
   * <Calendar
   *   drilldownView="agenda"
   * />
   * ```
   */
  drilldownView?: View;

  /**
   * Functionally equivalent to `drilldownView`, but accepts a function
   * that can return a view name. It's useful for customizing the drill-down
   * actions depending on the target date and triggering view.
   *
   * Return `null` to disable drill-down actions.
   *
   * ```js
   * <Calendar
   *   getDrilldownView={(targetDate, currentViewName, configuredViewNames) =>
   *     if (currentViewName === 'month' && configuredViewNames.includes('week'))
   *       return 'week'
   *
   *     return null;
   *   }}
   * />
   * ```
   */
  getDrilldownView: (
    targetDate: Date,
    currentViewName: View,
    configuredViewNames: View[],
  ) => View | null;

  /**
   * Determines the end date from date prop in the agenda view
   * date prop + length (in number of days) = end date
   */
  length?: number;

  /**
   * Determines whether the toolbar is displayed
   *
   * @defaultValue true
   */
  toolbar?: boolean;

  /**
   * Show truncated events in an overlay when you click the "+_x_ more" link.
   *
   * @defaultValue true
   */
  popup?: boolean;

  /**
   * Distance in pixels, from the edges of the viewport, the "show more" overlay
   * should be positioned.
   *
   * ```jsx
   * <Calendar popupOffset={30}/>
   * <Calendar popupOffset={{x: 30, y: 20}}/>
   * ```
   */
  popupOffset?: { x: number; y: number } | number;

  /**
   * Allows mouse selection of ranges of dates/times.
   *
   * The 'ignoreEvents' option prevents selection code from running when a
   * drag begins over an event. Useful when you want custom event click or drag
   * logic
   *
   * @defaultValue false
   */
  selectable?: Selectable;

  /**
   * Specifies the number of milliseconds the user must press and hold on the
   * screen for a touch to be considered a "long press." Long presses are used
   * for time slot selection on touch devices.
   *
   * @type {number}
   * @defaultValue 250
   */
  longPressThreshold?: number;

  /**
   * Determines the selectable time increments in week and day views, in minutes.
   */
  step?: number;

  /**
   * The number of slots per "section" in the time grid views. Adjust with `step`
   * to change the default of 1 hour long groups, with 30 minute slots.
   */
  timeslots?: number;

  /**
   * Switch the calendar to a `right-to-left` read direction.
   */
  rtl?: boolean;

  /**
   * Optionally provide a function that returns an object of className or style
   * props to be applied to the event node.
   *
   * ```ts
   * (
   * 	event: Object,
   * 	start: Date,
   * 	end: Date,
   * 	isSelected: boolean
   * ) => { className?: string, style?: Object }
   * ```
   */
  eventPropGetter?: (
    event: RNC.Event,
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => GetterResult;

  /**
   * Optionally provide a function that returns an object of className or style
   * props to be applied to the time-slot node. Caution! Styles that change
   * layout or position may break the calendar in unexpected ways.
   *
   * ```ts
   * (date: Date, resourceId?: number|string) => { className?: string, style?: Object }
   * ```
   */
  slotPropGetter?: (date: Date, resourceId?: number | string) => GetterResult;

  /**
   * Optionally provide a function that returns an object of props to be applied
   * to the time-slot group node. Useful to dynamically change the sizing of
   * time nodes.
   *
   * ```ts
   * () => { style?: Object }
   * ```
   */
  slotGroupPropGetter?: () => GetterResult;

  /**
   * Optionally provide a function that returns an object of className or style
   * props to be applied to the the day background. Caution! Styles that change
   * layout or position may break the calendar in unexpected ways.
   *
   * ```ts
   * (date: Date) => { className?: string, style?: Object }
   * ```
   */
  dayPropGetter?: (date: Date) => GetterResult;

  /**
   * Support to show multi-day events with specific start and end times in the
   * main time grid (rather than in the all day header).
   *
   * **Note: This may cause calendars with several events to look very busy in
   * the week and day views.**
   */
  showMultiDayTimes?: boolean;

  /**
   * Constrains the minimum _time_ of the Day and Week views.
   */
  min?: Date;

  /**
   * Constrains the maximum _time_ of the Day and Week views.
   */
  max?: Date;

  /**
   * Determines how far down the scroll pane is initially scrolled down.
   */
  scrollToTime?: Date;

  /**
   * Specify a specific culture code for the Calendar.
   *
   * **Note: it's generally better to handle this globally via your i18n library.**
   */
  culture?: string;

  /**
   * Localizer specific formats, tell the Calendar how to format and display
   * dates.
   *
   * `format` types are dependent on the configured localizer; both Moment and
   * Globalize accept strings of tokens according to their own specification,
   * such as: `'DD mm yyyy'`.
   *
   * ```jsx
   * let formats = {
   *   dateFormat: 'dd',
   *
   *   dayFormat: (date, , localizer) =>
   *     localizer.format(date, 'DDD', culture),
   *
   *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
   *     localizer.format(start, { date: 'short' }, culture) + ' – ' +
   *     localizer.format(end, { date: 'short' }, culture)
   * }
   *
   * <Calendar formats={formats} />
   * ```
   *
   * All localizers accept a function of
   * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
   */
  formats: Formats;

  /**
   * Customize how different sections of the calendar render by providing custom
   * Components. In particular the `Event` component can be specified for the
   * entire calendar, or you can provide an individual component for each view
   * type.
   *
   * ```jsx
   * const components = {
   *   event: MyEvent, // used by each view (Month, Day, Week)
   *   eventWrapper: MyEventWrapper,
   *   eventContainerWrapper: MyEventContainerWrapper,
   *   dateCellWrapper: MyDateCellWrapper,
   *   timeSlotWrapper: MyTimeSlotWrapper,
   *   timeGutterHeader: MyTimeGutterWrapper,
   *   toolbar: MyToolbar,
   *   agenda: {
   *     // with the agenda view use a different component to render events
   *   	 event: MyAgendaEvent
   *     time: MyAgendaTime,
   *     date: MyAgendaDate,
   *   },
   *   day: {
   *     header: MyDayHeader,
   *     event: MyDayEvent,
   *   },
   *   week: {
   *     header: MyWeekHeader,
   *     event: MyWeekEvent,
   *   },
   *   month: {
   *     header: MyMonthHeader,
   *     dateHeader: MyMonthDateHeader,
   *     event: MyMonthEvent,
   *   }
   * }
   * <Calendar components={components} />
   * ```
   */
  components: Components;

  /**
   * String messages used throughout the component, override to provide
   * localizations
   */
  messages: ReturnType<typeof applyMessages>;

  /**
   * A day event layout(arrangement) algorithm.
   * `overlap` allows events to be overlapped.
   * `no-overlap` resizes events to avoid overlap.
   * or custom `Function(events, minimumStartDifference, slotMetrics)`
   *
   * @defaultValue 'overlap'
   */
  dayLayoutAlgorithm: DayLayoutAlgorithm;

  /**
   * All provided data will be passed to CalendarContext. This is useful for
   * plugins
   */
  context: Record<string, unknown>;
};

function getViewNames(availableViews: View[] | CustomViews): View[] {
  return Array.isArray(availableViews)
    ? availableViews
    : (Object.keys(availableViews) as Array<keyof CustomViews>);
}

function isValidView(
  view: View,
  availableViews: View[] | CustomViews,
): boolean {
  const names = getViewNames(availableViews);
  return names.indexOf(view) !== -1;
}

/**
 * React Next Calendar is a full-featured Calendar component for managing events
 * and dates. It uses modern `flexbox` for layout, making it super responsive and
 * performant. Leaving most of the layout heavy lifting to the browser.
 * __Note:__ The default styles use `height: 100%` which means your container
 * must set an explicit height (feel free to adjust the styles to suit your
 * specific needs).
 *
 * React Next Calendar is unopiniated about editing and moving events, preferring
 * to let you implement it in a way that makes the most sense to your app.
 *
 * One thing to note is that, **React Next Calendar** treats event start/end dates
 * as an _exclusive_ range. which means that the event spans up to, but not
 * including, the end date. In the case of displaying events on whole days, end
 * dates are rounded _up_ to the next day. So an event ending on
 * `Apr 8th 12:00:00 am` will not appear on the 8th, whereas one ending on
 * `Apr 8th 12:01:00 am` will. If you want _inclusive_ ranges consider normalizing
 * the `end` date + 1 day for those events that end at midnight.
 */
export function Calendar({
  events,
  date: currentDate,

  view = views.MONTH,
  views: viewsProp = [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
  drilldownView = views.DAY,

  formats = {} as Formats,
  localizer: localizerProp,
  culture,
  messages = {} as ReturnType<typeof applyMessages>,

  step = 30,
  timeslots = 2,
  length = 30,
  longPressThreshold = 250,
  popup = false,
  toolbar = true,
  showMultiDayTimes = false,
  selectable = false,
  rtl = false,
  dayLayoutAlgorithm = 'overlap',

  elementProps = {} as HTMLAttributes<HTMLDivElement>,

  getDrilldownView: getDrilldownViewProp,
  getNow = () => new Date(),

  onRangeChange,
  onSelectEvent,
  onSelectSlot,
  onDrillDown,
  onDoubleClickEvent,
  onKeyPressEvent,
  onNavigate,
  onView,
  onShowMore,

  eventPropGetter,
  slotPropGetter,
  slotGroupPropGetter,
  dayPropGetter,

  components: componentsProp = {} as Components,

  context = {},

  ...props
}: CalendarProps) {
  const localizer = useMemo(() => {
    return mergeWithDefaults(
      localizerProp,
      formats,
      applyMessages(messages),
      culture,
    );
  }, [messages, localizerProp, culture, formats]);

  const getters = useMemo(
    () => ({
      dayProp: (date: Date) => dayPropGetter?.(date) || {},
      eventProp: (
        event: RNC.Event,
        start: Date,
        end: Date,
        selected: boolean,
      ) => eventPropGetter?.(event, start, end, selected) || {},
      slotProp: (...args: [Date, string | number | undefined]) =>
        slotPropGetter?.(...args) || {},
      slotGroupProp: () => slotGroupPropGetter?.() || {},
    }),
    [eventPropGetter, slotPropGetter, slotGroupPropGetter, dayPropGetter],
  );

  const [components, viewNames] = useMemo<[Components, View[]]>(() => {
    const names = getViewNames(viewsProp);

    return [
      defaults(componentsProp[view] || {}, omit(componentsProp, names), {
        eventWrapper: NoopWrapper,
        eventContainerWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
        timeSlotWrapper: NoopWrapper,
      } as Components) as Components,
      names,
    ];
  }, [viewsProp, view, componentsProp]);

  const current = currentDate || getNow();

  // TODO: memoize
  const View = getView();

  const CalToolbar = components.toolbar || Toolbar;
  const label = View.title(current, { localizer, length });

  function getViews(): Record<View, ExtendedFC<unknown>> {
    if (Array.isArray(viewsProp)) {
      const transformedViews = {} as Record<View, ExtendedFC>;
      (viewsProp as View[]).forEach((view: View) => {
        transformedViews[view] = VIEWS[view] as ExtendedFC<unknown>;
      });

      return transformedViews;
    }

    if (viewsProp && typeof viewsProp === 'object') {
      const transformedViews = {} as Record<View, ExtendedFC>;
      Object.keys(viewsProp).forEach(view => {
        if (
          typeof viewsProp[view as View] === 'boolean' &&
          viewsProp[view as View]
        ) {
          transformedViews[view as View] = VIEWS[
            view as View
          ] as ExtendedFC<unknown>;
        } else {
          transformedViews[view as View] = viewsProp[
            view as View
          ] as ExtendedFC<unknown>;
        }
      });

      return transformedViews;
    }

    return VIEWS;
  }

  function getView(): ExtendedFC {
    const availableViews = getViews();

    return availableViews[view];
  }

  function getDrillDownView(date: Date): View | null {
    if (!getDrilldownViewProp) {
      return drilldownView;
    }

    return getDrilldownViewProp(date, view, Object.keys(getViews()) as View[]);
  }

  /**
   *
   * @param {Date} date
   * @param {ReactElement} viewComponent
   * @param {View} [currentView] - optional parameter. It appears when range change on
   * view changing. It could be handy when you need to have both: range and view
   * type at once, i.e. for manage rbc state via url
   */
  function handleRangeChange(
    date: Date,
    viewComponent: ExtendedFC,
    currentView?: View,
  ) {
    if (onRangeChange) {
      if (viewComponent.range) {
        onRangeChange(viewComponent.range(date, { localizer }), currentView);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('onRangeChange prop not supported for this view');
        }
      }
    }
  }

  function handleNavigate(action: Action, newDate?: Date): void {
    const ViewComponent = getView();
    const today = getNow();

    const nextDate = moveDate(ViewComponent, {
      ...props,
      action,
      date: newDate || currentDate || today,
      today,
    });

    onNavigate(nextDate, view, action);
    handleRangeChange(nextDate, ViewComponent, view);
  }

  function handleViewChange(nextView: View): void {
    if (nextView !== view && isValidView(nextView, viewsProp)) {
      onView(nextView);
    }

    const availableViews = getViews();

    handleRangeChange(
      currentDate || getNow(),
      availableViews[nextView],
      nextView,
    );
  }

  function handleSelectEvent(...args: [event: RNC.Event, e: MouseEvent]): void {
    notify(onSelectEvent, ...args);
  }

  function handleDoubleClickEvent(
    ...args: [event: RNC.Event, e: MouseEvent]
  ): void {
    notify(onDoubleClickEvent, ...args);
  }

  function handleKeyPressEvent(
    ...args: [event: RNC.Event, e: KeyboardEvent]
  ): void {
    notify(onKeyPressEvent, ...args);
  }

  function handleSelectSlot(slotInfo: SlotInfo): void {
    notify(onSelectSlot, slotInfo);
  }

  function handleDrillDown(date: Date, view: View) {
    if (onDrillDown) {
      onDrillDown(date, view, drilldownView);
      return;
    }
    if (view) {
      handleViewChange(view);
    }

    handleNavigate(NavigateAction.DATE, date);
  }

  return (
    <CalendarContext.Provider value={{ rtl }}>
      <LocalizerContext.Provider value={localizer}>
        <PluginsContext.Provider value={context}>
          <GettersContext.Provider value={getters}>
            <div
              {...elementProps}
              className={clsx(
                elementProps?.className,
                'rbc-calendar',
                rtl && 'rbc-rtl',
              )}
            >
              {toolbar && (
                <CalToolbar
                  date={current}
                  view={view}
                  views={viewNames}
                  label={label}
                  onView={handleViewChange}
                  onNavigate={handleNavigate}
                />
              )}
              <View
                {...props}
                events={events}
                date={current}
                getNow={getNow}
                step={step}
                timeslots={timeslots}
                length={length}
                selectable={selectable}
                components={components}
                longPressThreshold={longPressThreshold}
                showMultiDayTimes={showMultiDayTimes}
                getDrilldownView={getDrillDownView}
                onDrillDown={handleDrillDown}
                onSelectEvent={handleSelectEvent}
                onDoubleClickEvent={handleDoubleClickEvent}
                onKeyPressEvent={handleKeyPressEvent}
                onSelectSlot={handleSelectSlot}
                // TODO: propagate popup to Month view only
                onShowMore={onShowMore}
                // TODO: propagate popup to Month view only
                popup={popup}
                dayLayoutAlgorithm={dayLayoutAlgorithm}
              />
            </div>
          </GettersContext.Provider>
        </PluginsContext.Provider>
      </LocalizerContext.Provider>
    </CalendarContext.Provider>
  );
}

export default uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectEvent',
});
