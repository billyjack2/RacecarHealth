// Shared fixtures for every UX variant. Attached to window so plain
// <script src="fixtures/data.js"></script> works under file:// — no
// modules, no fetch, no server required.
window.CROSSLINK = {
  team: {
    name: 'Crosslink Motorsports',
    slug: 'crosslink',
    membersCount: 8,
    activeCars: 5,
    sessionsThisWeek: 12,
    failuresThisWeek: 1,
  },

  user: {
    name: 'Billy Jack',
    initials: 'BJ',
    role: 'Crew chief',
  },

  cars: [
    {
      id: 'car_43', number: '43', name: 'Apex',
      carType: 'Spec Miata',
      driver: 'Diaz, M.',
      lastSessionAt: '2026-05-10',
      lastSessionTrack: 'Sebring Short',
      lastVerdict: 'pass',
      sessionsCount: 14,
      eventsCount: 5,
      trend: ['pass', 'pass', 'warn', 'pass', 'pass', 'pass', 'pass'],
      lastEvent: { id: 'evt_sebring_may', name: 'Sebring Short — May Test', track: 'Sebring Short', startDate: '2026-05-10', endDate: '2026-05-10', sessionsCount: 4, verdict: 'pass' },
      eventTrend: ['pass', 'pass', 'warn', 'pass', 'pass'],
    },
    {
      id: 'car_88', number: '88', name: 'Bolt',
      carType: 'Radical SR3',
      driver: 'Okafor, T.',
      lastSessionAt: '2026-05-12',
      lastSessionTrack: 'Road Atlanta',
      lastVerdict: 'fail',
      sessionsCount: 9,
      eventsCount: 4,
      trend: ['pass', 'warn', 'pass', 'pass', 'warn', 'fail'],
      lastEvent: { id: 'evt_road_atl_may', name: 'Road Atlanta — SCCA Majors', track: 'Road Atlanta', startDate: '2026-05-12', endDate: '2026-05-14', sessionsCount: 3, verdict: 'fail' },
      eventTrend: ['pass', 'warn', 'pass', 'fail'],
    },
    {
      id: 'car_7', number: '7', name: 'Comet',
      carType: 'LMP3',
      driver: 'Reyes, A.',
      lastSessionAt: '2026-05-09',
      lastSessionTrack: 'Daytona Road',
      lastVerdict: 'warn',
      sessionsCount: 22,
      eventsCount: 7,
      trend: ['pass', 'pass', 'pass', 'warn', 'warn', 'warn', 'warn'],
      lastEvent: { id: 'evt_daytona_may', name: 'Daytona Road — Spring Test', track: 'Daytona Road', startDate: '2026-05-09', endDate: '2026-05-09', sessionsCount: 2, verdict: 'warn' },
      eventTrend: ['pass', 'pass', 'warn', 'warn', 'warn'],
    },
    {
      id: 'car_21', number: '21', name: 'Drift',
      carType: 'GT4 Cayman',
      driver: 'Park, J.',
      lastSessionAt: '2026-05-04',
      lastSessionTrack: 'VIR Full',
      lastVerdict: 'pass',
      sessionsCount: 18,
      eventsCount: 6,
      trend: ['pass', 'pass', 'pass', 'pass', 'pass'],
      lastEvent: { id: 'evt_vir_may', name: 'VIR — Endurance Practice', track: 'VIR Full', startDate: '2026-05-04', endDate: '2026-05-04', sessionsCount: 5, verdict: 'pass' },
      eventTrend: ['pass', 'pass', 'pass', 'pass', 'pass'],
    },
    {
      id: 'car_99', number: '99', name: 'Echo',
      carType: 'Spec Miata',
      driver: 'Chen, L.',
      lastSessionAt: '2026-04-28',
      lastSessionTrack: 'Roebling Road',
      lastVerdict: 'pass',
      sessionsCount: 6,
      eventsCount: 2,
      trend: ['pass', 'pass', 'pass'],
      lastEvent: { id: 'evt_roebling_apr', name: 'Roebling Road — Open Test', track: 'Roebling Road', startDate: '2026-04-28', endDate: '2026-04-28', sessionsCount: 2, verdict: 'pass' },
      eventTrend: ['pass', 'pass'],
    },
  ],

  // Events group sessions. A session belongs to (car, event). Auto-bucketed by
  // track + date range. Events roll up worst-of across their sessions.
  events: [
    {
      id: 'evt_road_atl_may',
      name: 'Road Atlanta — SCCA Majors',
      track: 'Road Atlanta',
      startDate: '2026-05-12',
      endDate: '2026-05-14',
      kind: 'Race weekend',
      cars: ['car_88'],
      sessionsCount: 3,
      verdict: 'fail',
      notable: '#88 Bolt — coolant ceiling exceeded in afternoon stint',
    },
    {
      id: 'evt_sebring_may',
      name: 'Sebring Short — May Test',
      track: 'Sebring Short',
      startDate: '2026-05-10',
      endDate: '2026-05-10',
      kind: 'Test day',
      cars: ['car_43'],
      sessionsCount: 4,
      verdict: 'pass',
      notable: '#43 Apex — clean across all 4 stints',
    },
    {
      id: 'evt_daytona_may',
      name: 'Daytona Road — Spring Test',
      track: 'Daytona Road',
      startDate: '2026-05-09',
      endDate: '2026-05-09',
      kind: 'Test day',
      cars: ['car_7'],
      sessionsCount: 2,
      verdict: 'warn',
      notable: '#7 Comet — oil pressure trending low under sustained load',
    },
    {
      id: 'evt_vir_may',
      name: 'VIR — Endurance Practice',
      track: 'VIR Full',
      startDate: '2026-05-04',
      endDate: '2026-05-04',
      kind: 'Test day',
      cars: ['car_21'],
      sessionsCount: 5,
      verdict: 'pass',
      notable: '#21 Drift — strong full-distance practice',
    },
    {
      id: 'evt_roebling_apr',
      name: 'Roebling Road — Open Test',
      track: 'Roebling Road',
      startDate: '2026-04-28',
      endDate: '2026-04-28',
      kind: 'Test day',
      cars: ['car_99'],
      sessionsCount: 2,
      verdict: 'pass',
      notable: '#99 Echo — first event since refresh',
    },
    {
      id: 'evt_sebring_long_apr',
      name: 'Sebring Long — Spring Endurance',
      track: 'Sebring Long',
      startDate: '2026-04-18',
      endDate: '2026-04-19',
      kind: 'Race weekend',
      cars: ['car_43', 'car_7'],
      sessionsCount: 8,
      verdict: 'warn',
      notable: '#7 Comet — minor warns, no fails',
    },
  ],

  // One fully-populated session for the report page
  session: {
    id: 'sess_2026_05_12_bolt',
    car: { number: '88', name: 'Bolt', carType: 'Radical SR3', driver: 'Okafor, T.' },
    date: '2026-05-12',
    track: 'Road Atlanta',
    weather: '74°F, partly cloudy',
    duration: '2h 47m',
    rollupVerdict: 'fail',

    files: [
      { id: 'f1', name: 'morning-practice.csv',  start: '09:14', duration: '47m',    verdict: 'pass', samples: '1.8M' },
      { id: 'f2', name: 'midday-stint.csv',      start: '11:32', duration: '52m',    verdict: 'warn', samples: '2.0M' },
      { id: 'f3', name: 'afternoon-stint.csv',   start: '14:08', duration: '1h 08m', verdict: 'fail', samples: '2.6M' },
    ],

    summary: {
      checksRun: 8,
      passes: 5,
      warns: 2,
      fails: 1,
    },

    checkGroups: [
      {
        name: 'Engine',
        checks: [
          {
            name: 'RPM peak under redline',
            rollup: 'pass',
            threshold: 'max(RPM) < 8500',
            perFile: {
              f1: { verdict: 'pass', observed: '8120 rpm' },
              f2: { verdict: 'pass', observed: '8240 rpm' },
              f3: { verdict: 'pass', observed: '8390 rpm' },
            },
          },
          {
            name: 'Throttle application above 4k',
            rollup: 'pass',
            threshold: 'mean(ThrottlePos, 5s) > 35% when RPM > 4000',
            perFile: {
              f1: { verdict: 'pass', observed: '52%' },
              f2: { verdict: 'pass', observed: '48%' },
              f3: { verdict: 'pass', observed: '45%' },
            },
          },
        ],
      },
      {
        name: 'Fluids',
        checks: [
          {
            name: 'Coolant temp under load',
            rollup: 'fail',
            threshold: 'max(CoolantTemp) < 95°C when RPM > 4000',
            perFile: {
              f1: { verdict: 'pass', observed: '88°C' },
              f2: { verdict: 'warn', observed: '94°C' },
              f3: { verdict: 'fail', observed: '102°C' },
            },
          },
          {
            name: 'Oil pressure at high RPM',
            rollup: 'warn',
            threshold: 'min(OilPressure) > 60 psi when RPM > 6000',
            perFile: {
              f1: { verdict: 'pass', observed: '68 psi' },
              f2: { verdict: 'warn', observed: '58 psi' },
              f3: { verdict: 'warn', observed: '56 psi' },
            },
          },
          {
            name: 'Oil temperature ceiling',
            rollup: 'warn',
            threshold: 'max(OilTemp) < 130°C',
            perFile: {
              f1: { verdict: 'pass', observed: '118°C' },
              f2: { verdict: 'pass', observed: '124°C' },
              f3: { verdict: 'warn', observed: '132°C' },
            },
          },
        ],
      },
      {
        name: 'Electrical',
        checks: [
          {
            name: 'Battery voltage running',
            rollup: 'pass',
            threshold: 'mean(BatteryV, 10s) > 13.2 V when RPM > 1500',
            perFile: {
              f1: { verdict: 'pass', observed: '13.8 V' },
              f2: { verdict: 'pass', observed: '13.7 V' },
              f3: { verdict: 'pass', observed: '13.6 V' },
            },
          },
        ],
      },
      {
        name: 'Dynamics',
        checks: [
          {
            name: 'Lateral G sanity',
            rollup: 'pass',
            threshold: 'abs(LatG) < 2.8 G',
            perFile: {
              f1: { verdict: 'pass', observed: '2.2 G' },
              f2: { verdict: 'pass', observed: '2.3 G' },
              f3: { verdict: 'pass', observed: '2.4 G' },
            },
          },
          {
            name: 'GroundSpeed continuity',
            rollup: 'pass',
            threshold: 'no GroundSpeed dropouts > 3s',
            perFile: {
              f1: { verdict: 'pass', observed: 'ok' },
              f2: { verdict: 'pass', observed: 'ok' },
              f3: { verdict: 'pass', observed: 'ok' },
            },
          },
        ],
      },
    ],
  },
};
