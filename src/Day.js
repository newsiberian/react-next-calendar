import * as React from 'react'
import PropTypes from 'prop-types'

import * as dates from './utils/dates'
import { navigate } from './utils/constants'
import TimeGrid from './TimeGrid'

function Day({ date, ...props }) {
  const range = React.useMemo(() => Day.range(date), [date])

  return <TimeGrid {...props} range={range} eventOffset={10} />
}

Day.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
}

Day.range = (date) => {
  return [dates.startOf(date, 'day')]
}

Day.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day')

    case navigate.NEXT:
      return dates.add(date, 1, 'day')

    default:
      return date
  }
}

Day.title = (date, { localizer }) => localizer.format(date, 'dayHeaderFormat')

export default Day
