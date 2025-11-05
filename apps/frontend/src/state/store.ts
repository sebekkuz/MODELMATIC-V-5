import { create } from 'zustand';
import type { Project, Route, Scenario, Station } from '@prodsim/schemas';

type Mode = 'place' | 'flow' | 'move' | 'flowDel';

type StoreState = {
  project: Project;
  mode: Mode;
  selectedStationId?: string;
  selectedFlowId?: string;
  setMode(m: Mode): void;
  addStation(pos: { x: number; y: number }): void;
  updateStation(patch: Partial<Station> & { id: string }): void;
  removeStation(id: string): void;
  addConnection(from: string, to: string): void;
  removeConnection(id: string): void;
  setRoute(route: Route): void;
  setScenario(s: Scenario): void;
};

export const useStore = create<StoreState>((set) => ({
  project: {
    version: '1.0',
    layout: { grid: { cols: 12, rows: 4 }, stations: [], connections: [] },
    routes: [],
    buffers: [],
    people: [],
    tools: [],
  },
  mode: 'place',
  setMode: (m) => set({ mode: m }),
  addStation: (pos) =>
    set((s) => ({
      project: {
        ...s.project,
        layout: {
          ...s.project.layout,
          stations: [
            ...s.project.layout.stations,
            {
              id: crypto.randomUUID(),
              name: `Stanowisko ${s.project.layout.stations.length + 1}`,
              pos,
              capacity: 1,
              families: ['A', 'B', 'C'],
              opTypes: [],
              operations: [],
              bufferMode: 'info',
              buffers: {},
            },
          ],
        },
      },
    })),
  updateStation: (patch) =>
    set((s) => ({
      project: {
        ...s.project,
        layout: {
          ...s.project.layout,
          stations: s.project.layout.stations.map((st) =>
            st.id === patch.id ? { ...st, ...patch, pos: patch.pos ?? st.pos } : st
          ),
        },
      },
    })),
  removeStation: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        layout: {
          ...s.project.layout,
          stations: s.project.layout.stations.filter((st) => st.id !== id),
          connections: s.project.layout.connections.filter((c) => c.from !== id && c.to !== id),
        },
      },
    })),
  addConnection: (from, to) =>
    set((s) => ({
      project: {
        ...s.project,
        layout: {
          ...s.project.layout,
          connections: [
            ...s.project.layout.connections,
            { id: crypto.randomUUID(), from, to, name: 'flow', travel_s: 0, distance_m: 0 },
          ],
        },
      },
    })),
  removeConnection: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        layout: {
          ...s.project.layout,
          connections: s.project.layout.connections.filter((c) => c.id !== id),
        },
      },
    })),
  setRoute: (route) =>
    set((s) => ({
      project: {
        ...s.project,
        routes: [
          ...s.project.routes.filter(
            (r) =>
              !(
                r.family === route.family &&
                r.key === route.key &&
                r.kind === route.kind &&
                (r.size ?? null) === (route.size ?? null)
              )
          ),
          route,
        ],
      },
    })),
  setScenario: (scenario) =>
    set((s) => ({
      project: {
        ...s.project,
        scenario,
      },
    })),
}));
