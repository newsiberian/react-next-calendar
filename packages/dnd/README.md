### Drag and Drop addon for React Next Calendar

```jsx
import { Calendar } from '@react-next-calendar/core'
import useDragAndDrop from '@react-next-calendar/dnd'

import '@react-next-calendar/dnd/styles.css'

function MyCalendar(props) {
  const [
    context,
    components,
    selectable,
    elementProps,
    className,
  ] = useDragAndDrop(props);

  /* ... */

  return (
    <Calendar
      {...props} 
      context={context}
      components={components}
      selectable={selectable}
      elementProps={elementProps}
      className={className}
    />
  )
}
```
