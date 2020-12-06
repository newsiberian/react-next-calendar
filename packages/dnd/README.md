### Drag and Drop plugin for React Next Calendar

[Docs](https://newsiberian.github.io/react-next-calendar/?path=/story/dnd-basic-usage--basic-usage)

```jsx
import { Calendar } from '@react-next-calendar/core'
import useDragAndDrop from '@react-next-calendar/dnd'

import '@react-next-calendar/core/styles.css'
import '@react-next-calendar/dnd/styles.css'

function MyCalendar(props) {
  const [
    context,
    components,
    selectable,
    elementProps,
  ] = useDragAndDrop(props);

  /* ... */

  return (
    <Calendar
      {...props} 
      context={context}
      components={components}
      selectable={selectable}
      elementProps={elementProps}
    />
  )
}
```
