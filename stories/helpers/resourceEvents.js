const rencontreDate = new Date()
rencontreDate.setDate(2)
rencontreDate.setHours(5)
rencontreDate.setMinutes(30)

const anotherDate = new Date()
anotherDate.setDate(1)
anotherDate.setHours(2)
anotherDate.setMinutes(30)

const aDate = new Date()
aDate.setDate(4)
aDate.setHours(5)
aDate.setMinutes(30)

const bDate = new Date()
bDate.setDate(4)
bDate.setHours(5)
bDate.setMinutes(30)

const cDate = new Date()
cDate.setDate(4)
cDate.setHours(5)
cDate.setMinutes(30)

export default {
  events: [
    {
      title: 'Rencontre',
      resourceId: 'a',
      start: new Date(rencontreDate),
      end: new Date(rencontreDate.setHours(10)),
    },
    {
      title: 'Another Meeting',
      resourceId: 'b',
      start: new Date(anotherDate),
      end: new Date(anotherDate.setHours(4)),
    },
    {
      title: 'A',
      resourceId: 'a',
      start: new Date(aDate),
      end: new Date(aDate.setHours(10)),
    },
    {
      title: 'B',
      resourceId: 'b',
      start: new Date(bDate),
      end: new Date(bDate.setHours(10)),
    },
    {
      title: 'C',
      resourceId: 'c',
      start: new Date(cDate),
      end: new Date(cDate.setHours(10)),
    },
  ],

  list: [
    {
      id: 'a',
      title: 'Room A',
    },
    {
      id: 'b',
      title: 'Room B',
    },
    {
      id: 'c',
      title: 'Room C',
    },
  ],
}
