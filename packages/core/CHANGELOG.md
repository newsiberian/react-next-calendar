# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.2](https://github.com/newsiberian/react-next-calendar/compare/v1.0.1...v1.0.2) (2021-09-08)

**Note:** Version bump only for package @react-next-calendar/core





## [1.0.1](https://github.com/newsiberian/react-next-calendar/compare/v1.0.0...v1.0.1) (2021-09-08)


### Bug Fixes

* **core:** place outer div outside EventWrapper to keep positioning on top of the second. This fixes custom eventWrapper positioning at time grid ([d3215be](https://github.com/newsiberian/react-next-calendar/commit/d3215be1132dcc8e8aa41b91badb35d4570cab66))
* **core:** use internal rootRef instead of external `callback ref` to get popup sizes ([d237cd7](https://github.com/newsiberian/react-next-calendar/commit/d237cd7fa7ef6df1eaf3e42b5c02d793680dd2c7))





# [1.0.0](https://github.com/newsiberian/react-next-calendar/compare/v0.28.1...v1.0.0) (2020-12-01)


### Bug Fixes

* wrong argument in `handleRangeChange` ([be238db](https://github.com/newsiberian/react-next-calendar/commit/be238db481781ae4082212202742834f71e64142))


* BREAKING CHANGE: Rename core esm file to `react-next-calendar.esm.js` and core css file to `react-next-calendar.css` ([05983b9](https://github.com/newsiberian/react-next-calendar/commit/05983b91b868c30e4dcab848b0ffacdde1872ae5))


### BREAKING CHANGES

* Don't pass sass files to dist

refactor(core): improve typings
chore(core): change invariant to tiny-invariant
chore: add ts-jest





# [1.0.0](https://github.com/newsiberian/react-next-calendar/compare/v0.28.1...v) (2020-12-01)

### Bug Fixes

* avoid useless gutter measure ([0d96595](https://github.com/newsiberian/react-next-calendar/commit/0d9659545bffa1d286104455cd9d0546beb5ccaf))


### BREAKING CHANGES

* Don't pass sass files to dist
* Rename core esm file to `react-next-calendar.esm.js` and core css file to `react-next-calendar.css` ([05983b9](https://github.com/newsiberian/react-next-calendar/commit/05983b91b868c30e4dcab848b0ffacdde1872ae5))
* remove unused oldGlobalize Localizer  
  rename @react-next-calendar/core output styles to `styles.css ([6c8384af](https://github.com/newsiberian/react-next-calendar/commit/6c8384af8262732c9946866ceaff1e96c1d86810))
* drop `className` and `style` props usage. They are related w/ the root DIV element and should be included into `elementProps` props, which is the one that is passed to the root DIV ([d69dd690](https://github.com/newsiberian/react-next-calendar/commit/d69dd6902540e2b714d8c644aba6d8bac24589eb))
* drop umd build. We can add it again in future if someone will ask ([7de24018](https://github.com/newsiberian/react-next-calendar/commit/7de24018842ace34cc371f117c53ab502f2818b6))

* chore(core): change invariant to tiny-invariant
  chore: add ts-jest ([05983b91](https://github.com/newsiberian/react-next-calendar/commit/05983b91b868c30e4dcab848b0ffacdde1872ae5))
* refactor: massive changes: most of the code rewritten to typescript and moved to lerna packages. WIP.
  chore: examples removed, since it is better to go w/ storybook ([81cf7532](https://github.com/newsiberian/react-next-calendar/commit/81cf7532549e4b4d7a82b6373e715ed133280e3b))
* refactor(core): Calendar wrapped by CalendarContext.Provider; export CalendarContext ([8f6b7c74](https://github.com/newsiberian/react-next-calendar/commit/8f6b7c74cf54a8b8dd87c958c1949079c0777e50))
* refactor: move hooks to separate package and improve their typings ([098502b7](https://github.com/newsiberian/react-next-calendar/commit/098502b7be05214258c9c02b91f32de7f9a41c70))
* refactor: move common utils to new package `utils` ([dbdcc633](https://github.com/newsiberian/react-next-calendar/commit/dbdcc633506a69eedd4f0b358ddc23bc25c4c307))
* refactor(core): split calendar context into two parts: one for plugins, second for internal usage ([2192df2a](https://github.com/newsiberian/react-next-calendar/commit/2192df2a4ae421d7d080929285acb150df737959))


## [0.28.1](https://github.com/newsiberian/react-next-calendar/compare/v0.28.0...v0.28.1) (2020-10-08)


### Bug Fixes

* item preview inside cell while dragging from outside not working… ([#1770](https://github.com/newsiberian/react-next-calendar/issues/1770)) ([8fd6329](https://github.com/newsiberian/react-next-calendar/commit/8fd63298322ba506823f3c44eadd8820c2bf684b))



# [0.28.0](https://github.com/newsiberian/react-next-calendar/compare/v0.27.0...v0.28.0) (2020-09-16)


### Features

* add onKeyPressEvent ([#1754](https://github.com/newsiberian/react-next-calendar/issues/1754)) ([ca8d77b](https://github.com/newsiberian/react-next-calendar/commit/ca8d77b89403217047a801711d90cf3f8e8339d5))



# [0.27.0](https://github.com/newsiberian/react-next-calendar/compare/v0.26.1...v0.27.0) (2020-08-25)


### Features

* add resourceId to handleSelectAllDaySlot fns slotInfo ([#1735](https://github.com/newsiberian/react-next-calendar/issues/1735)) ([f00a516](https://github.com/newsiberian/react-next-calendar/commit/f00a516cdd7b1876d654bf863979b4f391bdb0bc))



## [0.26.1](https://github.com/newsiberian/react-next-calendar/compare/v0.26.0...v0.26.1) (2020-08-20)


### Bug Fixes

* Fix top part of 24hour event in week/day view ([#1732](https://github.com/newsiberian/react-next-calendar/issues/1732)) ([e1e06b5](https://github.com/newsiberian/react-next-calendar/commit/e1e06b54fcc71f35010448bfea858aa33b106eb1))



# [0.26.0](https://github.com/newsiberian/react-next-calendar/compare/v0.25.0...v0.26.0) (2020-06-24)


### Features

* starting to hooks to avoid deprecation warnings ([#1687](https://github.com/newsiberian/react-next-calendar/issues/1687)) ([b8368f9](https://github.com/newsiberian/react-next-calendar/commit/b8368f982d2463031a22979796ecd099bb1d7ee6))



# [0.25.0](https://github.com/newsiberian/react-next-calendar/compare/v0.24.6...v0.25.0) (2020-05-29)


### Bug Fixes

* hide indicator when current time is not in the interval ([#1639](https://github.com/newsiberian/react-next-calendar/issues/1639)) ([92974bf](https://github.com/newsiberian/react-next-calendar/commit/92974bf00abe067db981c00c734cd4f756fad4c7))


### Features

* add dragging ability from the monthly Popup component ([#1554](https://github.com/newsiberian/react-next-calendar/issues/1554)) ([12233ef](https://github.com/newsiberian/react-next-calendar/commit/12233efc7efdcb222954e9c6b2692e01a8101c42))



## [0.24.6](https://github.com/newsiberian/react-next-calendar/compare/v0.24.5...v0.24.6) (2020-05-04)


### Bug Fixes

* moment format strings -> date-fns format strings ([#1568](https://github.com/newsiberian/react-next-calendar/issues/1568)) ([1603902](https://github.com/newsiberian/react-next-calendar/commit/16039022378c428bc4a04b9f0fc20aa7f9892896))



## [0.24.5](https://github.com/newsiberian/react-next-calendar/compare/v0.24.4...v0.24.5) (2020-04-20)


### Bug Fixes

* prevent endless loop when adding event the DST begin day ([#1635](https://github.com/newsiberian/react-next-calendar/issues/1635)) ([b9abf77](https://github.com/newsiberian/react-next-calendar/commit/b9abf7714e54ef01a212366adffe09fec29039ba))



## [0.24.4](https://github.com/newsiberian/react-next-calendar/compare/v0.24.3...v0.24.4) (2020-04-17)


### Bug Fixes

*  `dayLayoutAlgorithm` prop with custom function ([#1562](https://github.com/newsiberian/react-next-calendar/issues/1562)) ([3fb3c49](https://github.com/newsiberian/react-next-calendar/commit/3fb3c49c05903e703e896f61ef1b9d1d18d7b2b2))



## [0.24.3](https://github.com/newsiberian/react-next-calendar/compare/v0.24.2...v0.24.3) (2020-04-09)


### Bug Fixes

* **date-fns localizer:** display dayFormat correctly ([#1633](https://github.com/newsiberian/react-next-calendar/issues/1633)) ([dd1e1a4](https://github.com/newsiberian/react-next-calendar/commit/dd1e1a4ec6c3183b2d69b58a59301133b2d81ca7))



## [0.24.2](https://github.com/newsiberian/react-next-calendar/compare/v0.24.1...v0.24.2) (2020-04-09)


### Bug Fixes

* dnd freezes an event intermittently ([#1631](https://github.com/newsiberian/react-next-calendar/issues/1631)) ([e8609af](https://github.com/newsiberian/react-next-calendar/commit/e8609af6a76cdc24387fbabb5a0e8c8f1700a617))



## [0.24.1](https://github.com/newsiberian/react-next-calendar/compare/v0.24.0...v0.24.1) (2020-03-11)


### Bug Fixes

* bump memoize-one and migrate new isEqual API ([#1583](https://github.com/newsiberian/react-next-calendar/issues/1583)) ([4c904c2](https://github.com/newsiberian/react-next-calendar/commit/4c904c2f06ad7fe6f6602d04cf14bcdaeab03ad2))
* for TimeSlots ([#1462](https://github.com/newsiberian/react-next-calendar/issues/1462)) ([c31639a](https://github.com/newsiberian/react-next-calendar/commit/c31639ab46f097ffd1b483aaba87832d14c01d73))



# [0.24.0](https://github.com/newsiberian/react-next-calendar/compare/v0.23.0...v0.24.0) (2020-02-13)


### Bug Fixes

* prefix React lifecycle methods with UNSAFE ([#1578](https://github.com/newsiberian/react-next-calendar/issues/1578)) ([7b5a6a7](https://github.com/newsiberian/react-next-calendar/commit/7b5a6a79c43591014fa7e009b8b3f00b4f74c7c9))


### Features

* add Date-fns localizer ([#1542](https://github.com/newsiberian/react-next-calendar/issues/1542)) ([749c91c](https://github.com/newsiberian/react-next-calendar/commit/749c91cc030bb45132da1870176d99156d6b784e))
* drop warning ([#1455](https://github.com/newsiberian/react-next-calendar/issues/1455)) ([77004e2](https://github.com/newsiberian/react-next-calendar/commit/77004e2a51dfa466341e14d2dab35466822d0efb))
* Slot group prop getter ([#1471](https://github.com/newsiberian/react-next-calendar/issues/1471)) ([#1510](https://github.com/newsiberian/react-next-calendar/issues/1510)) ([fcb9b9a](https://github.com/newsiberian/react-next-calendar/commit/fcb9b9ac4752bf9a68498672b2f4178dbc5770e5))



# [0.23.0](https://github.com/newsiberian/react-next-calendar/compare/v0.22.1...v0.23.0) (2019-11-04)


### Bug Fixes

* make scrollToTime=00:00 working ([#1501](https://github.com/newsiberian/react-next-calendar/issues/1501)) ([ee5a558](https://github.com/newsiberian/react-next-calendar/commit/ee5a5586814bfc56c4963e21b0d48ac9a22718db))


### Features

* add Rearrangement Algorithm Implementation ([#1473](https://github.com/newsiberian/react-next-calendar/issues/1473)) ([e622651](https://github.com/newsiberian/react-next-calendar/commit/e622651aac059ff6040a263e0d73521cd75bb42d))
* add resourceId to onSelecting callback ([#1416](https://github.com/newsiberian/react-next-calendar/issues/1416)) ([0c9b1f2](https://github.com/newsiberian/react-next-calendar/commit/0c9b1f2d3a6bc742b3b0b84c4bb4aee8cb5abc63))

## [0.22.1](https://github.com/intljusticemission/react-big-calendar/compare/v0.22.0...v0.22.1) (2019-09-13)

### Bug Fixes

- add new method to get correct time indicator top position | fixes [#1396](https://github.com/intljusticemission/react-big-calendar/issues/1396) ([#1447](https://github.com/intljusticemission/react-big-calendar/issues/1447)) ([1cf0205](https://github.com/intljusticemission/react-big-calendar/commit/1cf0205))
- drag cancelation for month view ([#1322](https://github.com/intljusticemission/react-big-calendar/issues/1322)) ([9c81e9e](https://github.com/intljusticemission/react-big-calendar/commit/9c81e9e))
- invalid prop-types. ([#1435](https://github.com/intljusticemission/react-big-calendar/issues/1435)) ([61e1a1e](https://github.com/intljusticemission/react-big-calendar/commit/61e1a1e))
- update time indicator position if max prop changes ([#1379](https://github.com/intljusticemission/react-big-calendar/issues/1379)) ([ac945b7](https://github.com/intljusticemission/react-big-calendar/commit/ac945b7))
- use fixed date arithmetic lib and move bt-sass to devdepen… ([#1374](https://github.com/intljusticemission/react-big-calendar/issues/1374)) ([b223a61](https://github.com/intljusticemission/react-big-calendar/commit/b223a61))

### Features

- [#1390](https://github.com/intljusticemission/react-big-calendar/issues/1390) use en dashes in ranges ([#1391](https://github.com/intljusticemission/react-big-calendar/issues/1391)) ([7619e59](https://github.com/intljusticemission/react-big-calendar/commit/7619e59))
- added continuesPrior and continuesAfter props to Event component ([#1201](https://github.com/intljusticemission/react-big-calendar/issues/1201)) ([74a2233](https://github.com/intljusticemission/react-big-calendar/commit/74a2233))
- upgrade react-overlays ([#1421](https://github.com/intljusticemission/react-big-calendar/issues/1421)) ([9117549](https://github.com/intljusticemission/react-big-calendar/commit/9117549))
- **dnd:** add preview of an item inside cell while dragging ([#1369](https://github.com/intljusticemission/react-big-calendar/issues/1369)) ([ac715f8](https://github.com/intljusticemission/react-big-calendar/commit/ac715f8))

## 0.22.0 (2019-06-18)

- Chore: clean up prop-types (#1344) ([94e3679](https://github.com/intljusticemission/react-big-calendar/commit/94e3679)), closes [#1344](https://github.com/intljusticemission/react-big-calendar/issues/1344)
- Publish v0.22.0 ([321d8cf](https://github.com/intljusticemission/react-big-calendar/commit/321d8cf))
- save snapshot ([8480413](https://github.com/intljusticemission/react-big-calendar/commit/8480413))
- stale-bot ([0e0ebb2](https://github.com/intljusticemission/react-big-calendar/commit/0e0ebb2))
- chore: fix linting ([976faf1](https://github.com/intljusticemission/react-big-calendar/commit/976faf1))
- chore: remove prop-types-extra (#1349) ([c3b7734](https://github.com/intljusticemission/react-big-calendar/commit/c3b7734)), closes [#1349](https://github.com/intljusticemission/react-big-calendar/issues/1349)
- chore(deps): upgrade date-math (#1354) ([762e8cf](https://github.com/intljusticemission/react-big-calendar/commit/762e8cf)), closes [#1354](https://github.com/intljusticemission/react-big-calendar/issues/1354)
- chore(deps): upgrade uncontrollable (#1357) ([689f74e](https://github.com/intljusticemission/react-big-calendar/commit/689f74e)), closes [#1357](https://github.com/intljusticemission/react-big-calendar/issues/1357)
- fix: bad propType. (#1351) ([e704e17](https://github.com/intljusticemission/react-big-calendar/commit/e704e17)), closes [#1351](https://github.com/intljusticemission/react-big-calendar/issues/1351)
- fix: bug where appointments can appear outside the calendar (#1204) ([9689b7d](https://github.com/intljusticemission/react-big-calendar/commit/9689b7d)), closes [#1204](https://github.com/intljusticemission/react-big-calendar/issues/1204)
- fix: bug with dayWrapper not applying (#1196) ([f3ea6f8](https://github.com/intljusticemission/react-big-calendar/commit/f3ea6f8)), closes [#1196](https://github.com/intljusticemission/react-big-calendar/issues/1196)
- fix: ie fix for event bindings on unmounted components (#1338) ([8ef00d6](https://github.com/intljusticemission/react-big-calendar/commit/8ef00d6)), closes [#1338](https://github.com/intljusticemission/react-big-calendar/issues/1338)
- fix: rtl incorrectly named or not propagated (#1353) ([caa863f](https://github.com/intljusticemission/react-big-calendar/commit/caa863f)), closes [#1353](https://github.com/intljusticemission/react-big-calendar/issues/1353)
- fix(addons): do not cut end while dragging multiday event (#1342) ([6fab261](https://github.com/intljusticemission/react-big-calendar/commit/6fab261)), closes [#1342](https://github.com/intljusticemission/react-big-calendar/issues/1342)
- docs: update docs and examples with named exports (#1352) ([f478be0](https://github.com/intljusticemission/react-big-calendar/commit/f478be0)), closes [#1352](https://github.com/intljusticemission/react-big-calendar/issues/1352)
- docs(dnd): remove deprecated comment about `react-dnd` (#1323) ([4d933c1](https://github.com/intljusticemission/react-big-calendar/commit/4d933c1)), closes [#1323](https://github.com/intljusticemission/react-big-calendar/issues/1323)
- feat: provide named exports api (#1348) ([4e09704](https://github.com/intljusticemission/react-big-calendar/commit/4e09704)), closes [#1348](https://github.com/intljusticemission/react-big-calendar/issues/1348)
- feat: redeclared all sass variables as !default (#1321) ([c4f09cd](https://github.com/intljusticemission/react-big-calendar/commit/c4f09cd)), closes [#1321](https://github.com/intljusticemission/react-big-calendar/issues/1321)
- feat: use lodash-es for esm bundle (#1350) ([fb0fe5e](https://github.com/intljusticemission/react-big-calendar/commit/fb0fe5e)), closes [#1350](https://github.com/intljusticemission/react-big-calendar/issues/1350)
- Feat: expose date localizer (#1347) ([5d93c9d](https://github.com/intljusticemission/react-big-calendar/commit/5d93c9d)), closes [#1347](https://github.com/intljusticemission/react-big-calendar/issues/1347)

### BREAKING CHANGE

- must use named exports for additional RBC imports

```js
import {
  Calendar,
  DateLocalizer,
  momentLocalizer,
  globalizeLocalizer,
  move,
  Views,
  Navigate,
  components,
} from 'react-big-calendar'
```

# [0.21.0](https://github.com/intljusticemission/react-big-calendar/compare/v0.20.4...v0.21.0) (2019-05-14)

### Bug Fixes

- prevent un/mounting of date components ([#1276](https://github.com/intljusticemission/react-big-calendar/issues/1276)) ([3c25009](https://github.com/intljusticemission/react-big-calendar/commit/3c25009)), closes [/github.com/intljusticemission/react-big-calendar/blob/master/src/DateContentRow.js#L121](https://github.com//github.com/intljusticemission/react-big-calendar/blob/master/src/DateContentRow.js/issues/L121)
- support point-in-time events in the Agenda view ([#1246](https://github.com/intljusticemission/react-big-calendar/issues/1246)) ([58c39c3](https://github.com/intljusticemission/react-big-calendar/commit/58c39c3))
- TimeGrid display on DST change days when min is after the transition ([#1303](https://github.com/intljusticemission/react-big-calendar/issues/1303)) ([b436017](https://github.com/intljusticemission/react-big-calendar/commit/b436017)), closes [#1098](https://github.com/intljusticemission/react-big-calendar/issues/1098) [#1273](https://github.com/intljusticemission/react-big-calendar/issues/1273)
- update time indicator position if min prop changes ([#1311](https://github.com/intljusticemission/react-big-calendar/issues/1311)) ([97ea841](https://github.com/intljusticemission/react-big-calendar/commit/97ea841))
- use React.createRef instead of string refs ([#1282](https://github.com/intljusticemission/react-big-calendar/issues/1282)) ([239f0a3](https://github.com/intljusticemission/react-big-calendar/commit/239f0a3))

### Features

- **dnd:** add onDropFromOutside prop for Dnd Cal ([#1290](https://github.com/intljusticemission/react-big-calendar/issues/1290)) ([b9fdce4](https://github.com/intljusticemission/react-big-calendar/commit/b9fdce4)), closes [#1090](https://github.com/intljusticemission/react-big-calendar/issues/1090)
- **dnd:** implement callback on initializing drag or resize action ([#1206](https://github.com/intljusticemission/react-big-calendar/issues/1206)) ([0fa2c30](https://github.com/intljusticemission/react-big-calendar/commit/0fa2c30)), closes [#1205](https://github.com/intljusticemission/react-big-calendar/issues/1205)
- add resource to handleDropFromOutside ([#1319](https://github.com/intljusticemission/react-big-calendar/issues/1319)) ([2b7ad2a](https://github.com/intljusticemission/react-big-calendar/commit/2b7ad2a))
- switch to Sass for styles ([884bece](https://github.com/intljusticemission/react-big-calendar/commit/884bece))

### BREAKING CHANGES

- Less files have been replaced with Sass versions

## [0.20.4](https://github.com/intljusticemission/react-big-calendar/compare/v0.20.3...v0.20.4) (2019-03-21)

### Bug Fixes

- allow override onShowMore callback ([#1214](https://github.com/intljusticemission/react-big-calendar/issues/1214)) ([8fefeee](https://github.com/intljusticemission/react-big-calendar/commit/8fefeee)), closes [/github.com/intljusticemission/react-big-calendar/blob/f9a873368a78f5ced81b799c4dffe1095b3ab712/src/Calendar.jsx#L280](https://github.com//github.com/intljusticemission/react-big-calendar/blob/f9a873368a78f5ced81b799c4dffe1095b3ab712/src/Calendar.jsx/issues/L280) [/github.com/intljusticemission/react-big-calendar/blob/1d62c432eaa183ed6b38f08cfcec5ee7edcbfe41/src/Month.js#L300-L307](https://github.com//github.com/intljusticemission/react-big-calendar/blob/1d62c432eaa183ed6b38f08cfcec5ee7edcbfe41/src/Month.js/issues/L300-L307) [#1147](https://github.com/intljusticemission/react-big-calendar/issues/1147)
- firefox event click bug ([#1262](https://github.com/intljusticemission/react-big-calendar/issues/1262)) ([b526416](https://github.com/intljusticemission/react-big-calendar/commit/b526416)), closes [#1173](https://github.com/intljusticemission/react-big-calendar/issues/1173)
- issue with gutter width initialization ([#1181](https://github.com/intljusticemission/react-big-calendar/issues/1181)) ([69b28af](https://github.com/intljusticemission/react-big-calendar/commit/69b28af))
- misplacement of current time indicator ([#1239](https://github.com/intljusticemission/react-big-calendar/issues/1239)) ([2d6e99e](https://github.com/intljusticemission/react-big-calendar/commit/2d6e99e)), closes [#1054](https://github.com/intljusticemission/react-big-calendar/issues/1054)
- remove duplicate getter prop ([#1185](https://github.com/intljusticemission/react-big-calendar/issues/1185)) ([6b90182](https://github.com/intljusticemission/react-big-calendar/commit/6b90182))
- remove global window from Map() usage, update eslint rules for new es6 environment ([#1195](https://github.com/intljusticemission/react-big-calendar/issues/1195)) ([4768188](https://github.com/intljusticemission/react-big-calendar/commit/4768188))
- selecting events in mobile browsers ([#1233](https://github.com/intljusticemission/react-big-calendar/issues/1233)) ([2bc9fee](https://github.com/intljusticemission/react-big-calendar/commit/2bc9fee))

### Features

- add ability to set custom resource headers ([#1187](https://github.com/intljusticemission/react-big-calendar/issues/1187)) ([6708a45](https://github.com/intljusticemission/react-big-calendar/commit/6708a45)), closes [#1174](https://github.com/intljusticemission/react-big-calendar/issues/1174)
- adding bounds and box on slot select in Month view ([#1241](https://github.com/intljusticemission/react-big-calendar/issues/1241)) ([2a870b0](https://github.com/intljusticemission/react-big-calendar/commit/2a870b0))
- remove propTypes in production ([#1180](https://github.com/intljusticemission/react-big-calendar/issues/1180)) ([ce0d56b](https://github.com/intljusticemission/react-big-calendar/commit/ce0d56b))

## [0.20.2](https://github.com/intljusticemission/react-big-calendar/compare/v0.20.0...v0.20.2) (2018-11-07)

### Bug Fixes

- add runtime to deps ([ade68bb](https://github.com/intljusticemission/react-big-calendar/commit/ade68bb))
- calculation of slots number for date when DST ends. ([#1046](https://github.com/intljusticemission/react-big-calendar/issues/1046)) ([2ca0226](https://github.com/intljusticemission/react-big-calendar/commit/2ca0226))
- dragging is disabled if resizing is not allowed ([#1072](https://github.com/intljusticemission/react-big-calendar/issues/1072)) ([#1073](https://github.com/intljusticemission/react-big-calendar/issues/1073)) ([0d5ed30](https://github.com/intljusticemission/react-big-calendar/commit/0d5ed30))
- elements position on TimeGrid if max prop is set ([#1057](https://github.com/intljusticemission/react-big-calendar/issues/1057)) ([f174a60](https://github.com/intljusticemission/react-big-calendar/commit/f174a60))
- move [@babel](https://github.com/babel)/cli to devDependencies ([#1062](https://github.com/intljusticemission/react-big-calendar/issues/1062)) ([4cfcb1f](https://github.com/intljusticemission/react-big-calendar/commit/4cfcb1f))
- onRangeChange not passing localizer ([#1056](https://github.com/intljusticemission/react-big-calendar/issues/1056)) ([80855e8](https://github.com/intljusticemission/react-big-calendar/commit/80855e8))
- proptype warnings ([#1084](https://github.com/intljusticemission/react-big-calendar/issues/1084)) ([08c2494](https://github.com/intljusticemission/react-big-calendar/commit/08c2494))
- reference to draggable/resizable Accessor ([#1070](https://github.com/intljusticemission/react-big-calendar/issues/1070)) ([1889a51](https://github.com/intljusticemission/react-big-calendar/commit/1889a51))

### Features

- hide single day header with css ([#1019](https://github.com/intljusticemission/react-big-calendar/issues/1019)) ([5857d8f](https://github.com/intljusticemission/react-big-calendar/commit/5857d8f))

### Performance Improvements

- increase startup time of event dragging ([#1020](https://github.com/intljusticemission/react-big-calendar/issues/1020)) ([167b69f](https://github.com/intljusticemission/react-big-calendar/commit/167b69f))

## v0.19.2 - Wed, 27 Jun 2018 14:24:55 GMT

## v0.19.1 - Thu, 03 May 2018 15:22:43 GMT

## v0.19.0 - Fri, 23 Mar 2018 17:13:33 GMT

## v0.18.0 - Wed, 07 Feb 2018 16:14:20 GMT

## v0.17.1 - Tue, 05 Dec 2017 19:42:18 GMT

- [#634](../../pull/634) added a new optional callback `dayPropGetter` to allow customization of the cell backgrounds of month, week, and work week views without the need for custom components

## v0.17.0 - Thu, 02 Nov 2017 15:26:08 GMT

## v0.16.1 - Fri, 29 Sep 2017 15:49:07 GMT

## v0.16.0 - Fri, 29 Sep 2017 15:42:08 GMT

## v0.15.0 - Tue, 29 Aug 2017 18:20:39 GMT

## v0.14.4 - Fri, 23 Jun 2017 13:59:31 GMT

## v0.14.3 - Wed, 21 Jun 2017 14:23:07 GMT

## v0.14.2 - Mon, 19 Jun 2017 15:41:40 GMT

## v0.14.1 - Mon, 19 Jun 2017 15:41:20 GMT

## v0.14.0 - Tue, 02 May 2017 13:14:45 GMT

## v0.13.0 - Wed, 22 Mar 2017 15:09:54 GMT

## v0.12.3 - Sun, 15 Jan 2017 17:15:59 GMT

## v0.12.2 - Sun, 15 Jan 2017 17:09:50 GMT

- [45687c9](../../commit/45687c9) [fixed] allow string names in `move()`

## v0.12.1 - Thu, 12 Jan 2017 20:47:22 GMT

- [5578559](../../commit/5578559) [fixed] all day event selection

## v0.12.0 - Sat, 07 Jan 2017 22:03:45 GMT

## v0.11.1 - Sun, 20 Nov 2016 17:48:51 GMT

## v0.11.0 - Sat, 08 Oct 2016 20:24:51 GMT

## v0.10.3 - Fri, 15 Jul 2016 17:56:54 GMT

## v0.10.2 - Fri, 10 Jun 2016 12:50:39 GMT

- [741c882](../../commit/741c882) [fixed] rm jsx imports

## v0.10.1 - Thu, 09 Jun 2016 18:39:57 GMT

## v0.10.0 - Thu, 09 Jun 2016 15:33:06 GMT

## v0.9.12 - Fri, 20 May 2016 12:54:29 GMT

## v0.9.11 - Fri, 15 Apr 2016 13:39:50 GMT

## v0.9.10 - Fri, 15 Apr 2016 13:31:58 GMT

## v0.9.9 - Fri, 15 Apr 2016 12:28:00 GMT

- [a2a49c8](../../commit/a2a49c8) [fixed] consistent handling of end dates as _exclusive_ ranges
- [1c12b16](../../commit/1c12b16) [fixed] DST issue with events
- [f526e23](../../commit/f526e23) [added] onSelecting callback
- [18c0234](../../commit/18c0234) [fixed] incorrect page offset
- [4eeacd4](../../commit/4eeacd4) [fixed] more cross browser flex issues.
- [2dc61ec](../../commit/2dc61ec) [fixed] add minHeight for week view overflow

## v0.9.8 - Thu, 14 Jan 2016 19:35:07 GMT

- [5fa7012](../../commit/5fa7012) [fixed] Incorrect gutter widths

## v0.9.7 - Sun, 13 Dec 2015 22:01:09 GMT

- [ebf8908](../../commit/ebf8908) [fixed] agenda header display

## v0.9.6 - Sun, 13 Dec 2015 21:39:49 GMT

- [a69600b](../../commit/a69600b) [fixed] Pass correct date to DaySlot for selections.
- [5ac5c30](../../commit/5ac5c30) [fixed] reset gutter widths before calculations

## v0.9.5 - Wed, 02 Dec 2015 18:09:32 GMT

- [c2e8aa4](../../commit/c2e8aa4) [fixed] accidental breaking change on the localizers
- [dc90943](../../commit/dc90943) [fixed] some style issues
- [ea8e085](../../commit/ea8e085) [added] modern globalize support
- [4b3d3ba](../../commit/4b3d3ba) [fixed] have gutter use culture prop
- [7922882](../../commit/7922882) [fixed] better gutter width detection

## v0.9.4 - Sun, 29 Nov 2015 02:19:49 GMT

- [a41c9f9](../../commit/a41c9f9) [added] right-to-left support
- [8bb6589](../../commit/8bb6589) [fixed] properly select time ranges with min/max set

## v0.9.3 - Sat, 28 Nov 2015 20:00:24 GMT

- [fff1914](../../commit/fff1914) [fixed] pass culture to View

## v0.9.2 - Thu, 12 Nov 2015 23:34:33 GMT

- [58f008f](../../commit/58f008f) [fixed] none integer slot spaces (again)
- [f2084ef](../../commit/f2084ef) [fixed] month event rows not fitting in their cells
- [73e449d](../../commit/73e449d) [fixed] day view clicks return the correct slot

## v0.9.1 - Thu, 12 Nov 2015 14:52:20 GMT

- [d5a0d20](../../commit/d5a0d20) [fixed] month event rows not fitting in their cells
- [f4b18d6](../../commit/f4b18d6) [fixed] day view clicks return the correct slot

## v0.9.0 - Tue, 03 Nov 2015 11:33:38 GMT

- [ee53bbc](../../commit/ee53bbc) [changed] default "show more" behavior navigates to day view
- [80aa08f](../../commit/80aa08f) [added] popupOffset prop for configuring distance from viewport edge

## v0.8.3 - Thu, 29 Oct 2015 06:07:22 GMT

- [d98af8d](../../commit/d98af8d) [added] edge detection for event popup
- [69b092d](../../commit/69b092d) [fixed] accidental hash changes
- [0351b71](../../commit/0351b71) [fixed] incorrect 'show more' layout

## v0.8.2 - Wed, 28 Oct 2015 08:09:39 GMT

- [892af3d](../../commit/892af3d) [fixed] use correct handler for "show more"

## v0.8.1 - Wed, 28 Oct 2015 07:58:13 GMT

- [4560ff7](../../commit/4560ff7) [changed] better thin event title collapse
- [0eeb43f](../../commit/0eeb43f) [fixed] event layout sort
- [0574eed](../../commit/0574eed) [fixed] show more row layout issues
- [7ee9959](../../commit/7ee9959) [added] title to time view events
- [c07d0ab](../../commit/c07d0ab) [changed] better event overlays for overlapping events

## v0.8.0 - Mon, 26 Oct 2015 12:32:54 GMT

- [4dac3f5](../../commit/4dac3f5) [added] rbc-event-allday class in month view
- [e314128](../../commit/e314128) [fixed] missing keys in popup
- [0d5df79](../../commit/0d5df79) [changed] "show more" behavior is cleaner

## v0.7.2 - Sat, 24 Oct 2015 03:21:53 GMT

- [0b0fa0f](../../commit/0b0fa0f) [fixed] prevent selection when clicking show more
- [57c8843](../../commit/57c8843) [fixed] allow event selection when selectable, in day views

## v0.7.1 - Wed, 30 Sep 2015 12:34:43 GMT

- [f7969b3](../../commit/f7969b3) [fixed] use client coords to get node during selection

## v0.7.0 - Tue, 15 Sep 2015 08:37:50 GMT

- [8ad4ee7](../../commit/8ad4ee7) [changed] selection bound to Calendar container, respects overlays
- [98b3dad](../../commit/98b3dad) [fixed] selecting events in All Day row of week/Day views

## v0.6.1 - Sun, 13 Sep 2015 16:52:20 GMT

- [c3092f4](../../commit/c3092f4) [fixed] event rows incorrect duration styles
- [dade2b9](../../commit/dade2b9) [fixed] more month event layout issues

## v0.6.0 - Sun, 13 Sep 2015 15:32:08 GMT

- [49e321f](../../commit/49e321f) [fixed] layout of events in months that don't start evenly at weekday 0
- [720675e](../../commit/720675e) [added] eventPropsGetter for event markup customization

## v0.5.2 - Sun, 13 Sep 2015 12:56:02 GMT

- [386d4bc](../../commit/386d4bc) [fixed] `selectable` can properly be toggled on and off

## v0.5.1 - Sun, 13 Sep 2015 10:08:24 GMT

- [a7dc435](../../commit/a7dc435) [fixed] className and style props being applied in multiple places
- [c8f8281](../../commit/c8f8281) [fixed] null exception on empty agenda view

## v0.5.0 - Sun, 13 Sep 2015 09:03:11 GMT

- [00435ad](../../commit/00435ad) [fixed] view propType validation
- [ae039b9](../../commit/ae039b9) [added] expose `move` and `label` methods for easier external toolbars
- [7e7bc17](../../commit/7e7bc17) [changed] clarified accidental ambigious license

## v0.4.1 - Thu, 03 Sep 2015 19:08:11 GMT
