import { MinHeap } from './priority-queue';
import type { EngineConfig, EngineHooks, Event, EventKind, SimTime, Token } from './types';

export class Engine {
  now = 0;
  private seq = 0;
  private heap = new MinHeap<Event>((a, b) => (a.t === b.t ? a.seq < b.seq : a.t < b.t));
  private active = 0;
  private nextOrder = 0;

  constructor(public cfg: EngineConfig, private hooks?: EngineHooks) {}

  schedule(t: SimTime, kind: EventKind, data: any) {
    this.heap.push({ t, kind, data, seq: this.seq++ });
  }

  tryReleases() {
    const orders = this.cfg.orders;
    let changed = false;
    while (this.nextOrder < orders.length) {
      const o = orders[this.nextOrder];
      if (o.release > this.now) break;
      if (this.active >= this.cfg.WIP) break;

      this.active++;
      this.nextOrder++;

      for (const f of o.funs) {
        const tok: Token = { prodId: o.id, fun: f, opIdx: 0 };
        this.enqueueOrStart(tok);
      }

      changed = true;
    }
    return changed;
  }

  private chooseStation(op: string, eligible: string[]): string {
    let chosen: string | undefined;
    let chosenFreeAt = Infinity;
    let chosenQueue = Infinity;

    for (const id of eligible) {
      const st = this.cfg.stations[id];
      if (!st) continue;

      const nextFree = Math.min(...st.busyUntil);
      const queueLength = st.queue.length;

      if (
        chosen === undefined ||
        nextFree < chosenFreeAt ||
        (nextFree === chosenFreeAt && queueLength < chosenQueue) ||
        (nextFree === chosenFreeAt && queueLength === chosenQueue && id < chosen)
      ) {
        chosen = id;
        chosenFreeAt = nextFree;
        chosenQueue = queueLength;
      }
    }

    if (!chosen) {
      throw new Error(`Brak stacji dla op: ${op}`);
    }

    return chosen;
  }

  enqueueOrStart(tok: Token) {
    const route = this.cfg.routes[tok.fun];
    if (!route?.length) return;

    tok.currentOp = route[tok.opIdx];
    if (!tok.currentOp) return;

    const tSec = this.cfg.timeMap[tok.fun]?.[tok.currentOp] ?? 0;
    const eligible = this.cfg.able[tok.currentOp] || [];
    if (!eligible.length) {
      throw new Error(`Brak stacji dla op: ${tok.currentOp}`);
    }

    const stId = this.chooseStation(tok.currentOp, eligible);
    tok.stId = stId;
    const st = this.cfg.stations[stId];
    const srv = st.busyUntil.findIndex((u) => u <= this.now);

    if (srv >= 0) {
      const finish = this.now + tSec;
      st.busyUntil[srv] = finish;
      st.busySum += tSec;
      this.schedule(finish, 'END_OP', { tok: { ...tok }, stId, srv });
    } else {
      st.queue.push({ ...tok });
    }
  }

  tryStartFromQueue(stId: string) {
    const st = this.cfg.stations[stId];
    if (!st) return;

    for (let i = 0; i < st.busyUntil.length; i++) {
      if (st.busyUntil[i] <= this.now && st.queue.length) {
        const tok = st.queue.shift()!;
        tok.stId = stId;
        const tSec = this.cfg.timeMap[tok.fun]?.[tok.currentOp!] ?? 0;
        const finish = this.now + tSec;
        st.busyUntil[i] = finish;
        st.busySum += tSec;
        this.schedule(finish, 'END_OP', { tok, stId, srv: i });
      }
    }
  }

  step() {
    const ev = this.heap.pop();
    if (!ev) return false;

    this.now = ev.t;
    this.hooks?.onEvent?.(ev, this);

    if (ev.kind === 'END_OP') {
      const tok: Token = ev.data.tok;
      const st = this.cfg.stations[ev.data.stId];
      if (st) {
        st.busyUntil[ev.data.srv] = this.now;
        st.doneCount++;
      }

      tok.opIdx++;
      const route = this.cfg.routes[tok.fun] || [];
      if (tok.opIdx >= route.length) {
        this.active = Math.max(0, this.active - 1);
      } else {
        this.enqueueOrStart(tok);
      }

      this.tryStartFromQueue(ev.data.stId);
    }

    this.tryReleases();
    return true;
  }

  run() {
    this.tryReleases();

    while (this.heap.size() || this.nextOrder < this.cfg.orders.length) {
      if (this.heap.size()) {
        this.step();
        continue;
      }

      const nextRelease = this.cfg.orders[this.nextOrder]?.release;
      if (nextRelease === undefined) break;

      if (nextRelease > this.now) {
        this.now = nextRelease;
        this.hooks?.onTick?.(this.now, this);
      }

      this.tryReleases();
    }

    return this.summary();
  }

  summary() {
    return {
      time: this.now,
      stations: Object.fromEntries(
        Object.entries(this.cfg.stations).map(([id, s]) => [id, { busySum: s.busySum, done: s.doneCount, m: s.m }])
      )
    };
  }
}