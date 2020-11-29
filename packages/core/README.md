# React Next Calendar

An events calendar component built for React and made for modern browsers and
uses flexbox over the classic tables-ception approach.

[**DEMO and Docs**](http://jquense.github.io/react-big-calendar/examples/index.html)

Inspired by [Full Calendar](http://fullcalendar.io/).

## Use and Setup

`yarn add @react-next-calendar/core` or `npm install --save @react-next-calendar/core`

Include `@react-next-calendar/core/styles.css` for styles, and make sure your
calendar's container element has a height, or the calendar won't be visible. To
provide your own custom styling, see the [Custom Styling](#custom-styling) topic.

## Run storybook locally

```sh
$ git clone git@github.com:newsiberian/react-next-calendar.git
$ cd react-next-calendar
$ yarn
$ yarn storybook
```

- Open [localhost:9001](http://localhost:9001/).

### Localization and Date Formatting

**React Next Calendar** includes three options for handling the date formatting and
culture localization, depending on your preference of DateTime libraries. You can
use either the [Moment.js](http://momentjs.com/) or [Globalize.js](https://github.com/jquery/globalize)
or even better [date-fns](https://date-fns.org/) localizers.

Regardless of your choice, you **must** choose a localizer to use this library:

#### Moment.js

```jsx
import { Calendar, momentLocalizer } from 'react-next-calendar'
import moment from 'moment'

const localizer = momentLocalizer(moment)

const MyCalendar = props => (
  <div>
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  </div>
)
```

#### Globalize.js v0.1.1

```jsx
import { Calendar, globalizeLocalizer } from 'react-next-calendar'
import globalize from 'globalize'

const localizer = globalizeLocalizer(globalize)

const MyCalendar = props => (
  <div>
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  </div>
)
```

#### date-fns

```jsx
import { Calendar, dateFnsLocalizer } from 'react-next-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
const locales = {
  'en-US': require('date-fns/locale/en-US'),
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const MyCalendar = props => (
  <div>
    <Calendar
      localizer={localizer}
      events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  </div>
)
```

## Custom Styling

Out of the box, you can include the compiled CSS files and be up and running.
But, sometimes, you may want to style React Next Calendar to match your application
styling. In this case you can take styles from [here](https://github.com/newsiberian/react-next-calendar/tree/main/packages/core/src/sass)

SASS implementation provides a `variables` file containing color and sizing
variables that you can update to fit your application. _Note:_ Changing and/or
overriding styles can cause rendering issues with your Raect Next Calendar.
Carefully test each change accordingly.
