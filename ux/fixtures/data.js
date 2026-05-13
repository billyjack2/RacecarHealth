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
      trend: ['pass', 'pass', 'warn', 'pass', 'pass', 'pass', 'pass'],
    },
    {
      id: 'car_88', number: '88', name: 'Bolt',
      carType: 'Radical SR3',
      driver: 'Okafor, T.',
      lastSessionAt: '2026-05-12',
      lastSessionTrack: 'Road Atlanta',
      lastVerdict: 'fail',
      sessionsCount: 9,
      trend: ['pass', 'warn', 'pass', 'pass', 'warn', 'fail'],
    },
    {
      id: 'car_7', number: '7', name: 'Comet',
      carType: 'LMP3',
      driver: 'Reyes, A.',
      lastSessionAt: '2026-05-09',
      lastSessionTrack: 'Daytona Road',
      lastVerdict: 'warn',
      sessionsCount: 22,
      trend: ['pass', 'pass', 'pass', 'warn', 'warn', 'warn', 'warn'],
    },
    {
      id: 'car_21', number: '21', name: 'Drift',
      carType: 'GT4 Cayman',
      driver: 'Park, J.',
      lastSessionAt: '2026-05-04',
      lastSessionTrack: 'VIR Full',
      lastVerdict: 'pass',
      sessionsCount: 18,
      trend: ['pass', 'pass', 'pass', 'pass', 'pass'],
    },
    {
      id: 'car_99', number: '99', name: 'Echo',
      carType: 'Spec Miata',
      driver: 'Chen, L.',
      lastSessionAt: '2026-04-28',
      lastSessionTrack: 'Roebling Road',
      lastVerdict: 'pass',
      sessionsCount: 6,
      trend: ['pass', 'pass', 'pass'],
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
