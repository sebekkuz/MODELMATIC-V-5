// Minimal self-contained simulation engine (no external relative imports)
// ESM-friendly: no extension-less imports, no runtime dependencies within the package.
export type StationState = {
  id: string;
  m: number;                 // capacity (parallel servers)
  busyUntil: number[];       // per-server availability time
  queue: any[];              // placeholder queue, not used in this minimal version
  busySum: number;           // accumulated busy time for utilization
  doneCount: number;         // completed tasks
};

export type EngineConfig = {
  stations: Record<string, StationState>;
  routes: Record<string, string[]>;                   // key -> sequence of operations
  timeMap: Record<string, Record<string, number>>;    // key -> op -> time
  able: Record<string, string[]>;                     // op -> list of stations that can do it
  orders: { id: string; release: number; funs: string[] }[];
  WIP: number;
};

export class Engine {
  cfg: EngineConfig;
  constructor(cfg: EngineConfig) {
    this.cfg = cfg;
  }

  private pickMachine(station: StationState): number {
    // pick server index with the earliest availability
    let idx = 0;
    let best = station.busyUntil[0] ?? 0;
    for (let i=1;i<station.busyUntil.length;i++){
      const t = station.busyUntil[i];
      if (t < best) { best = t; idx = i; }
    }
    return idx;
  }

  run() {
    const { stations, routes, timeMap, able, orders } = this.cfg;
    let now = 0;

    // very simple greedy scheduler: per order -> per fun -> per operation
    for (const o of orders) {
      now = Math.max(now, o.release || 0);
      for (const funKey of o.funs) {
        const ops = routes[funKey] || [];
        for (const op of ops) {
          const stList = able[op] || [];
          if (!stList.length) continue;
          // choose the station with the earliest free machine
          let bestStation = stations[stList[0]];
          let bestIdx = this.pickMachine(bestStation);
          let bestTime = bestStation.busyUntil[bestIdx];
          for (let k=1;k<stList.length;k++){
            const s = stations[stList[k]];
            const idx = this.pickMachine(s);
            const t = s.busyUntil[idx];
            if (t < bestTime) { bestStation = s; bestIdx = idx; bestTime = t; }
          }
          const setup = 0;
          const proc = (timeMap[funKey]?.[op] ?? 1);
          const start = Math.max(now, bestTime);
          const finish = start + setup + proc;
          bestStation.busySum += (finish - start);
          bestStation.busyUntil[bestIdx] = finish;
          bestStation.doneCount += 1;
          now = finish;
        }
      }
    }

    // makespan = max station busyUntil
    let makespan = 0;
    for (const s of Object.values(stations)) {
      for (const t of s.busyUntil) makespan = Math.max(makespan, t);
    }
    return { time: makespan, stations };
  }
}
