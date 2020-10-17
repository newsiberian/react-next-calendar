import * as React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { navigate } from './utils/constants'
import { arrayMap } from './utils/helpers'

function Toolbar({ label, localizer, view, views, onNavigate, onView }) {
  function handleNavigate(action) {
    onNavigate(action)
  }

  function handleView(view) {
    onView(view)
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleNavigate(navigate.TODAY)}>
          {localizer.messages.today}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.PREVIOUS)}>
          {localizer.messages.previous}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.NEXT)}>
          {localizer.messages.next}
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">
        {arrayMap(views)((name) => (
          <button
            key={name}
            type="button"
            className={clsx({ 'rbc-active': view === name })}
            onClick={() => handleView(name)}
          >
            {localizer.messages[name]}
          </button>
        ))}
      </span>
    </div>
  )
}

Toolbar.propTypes = {
  view: PropTypes.string.isRequired,
  views: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.node.isRequired,
  localizer: PropTypes.object,
  onNavigate: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
}

export default Toolbar
