import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import { Engine } from '@prodsim/sim-engine';
import type { Project } from '@prodsim/schemas';

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.CORS_ORIGIN || true });
await app.register(websocket);

app.get('/health', async () => ({ ok: true }));

app.get('/ws', { websocket: true }, (conn: any) => {
  const socket = conn.socket as WebSocket;
  socket.send(JSON.stringify({ type: 'HELLO_OK', server: 'backend', version: '1.0' }));
  socket.on('message', (buf: Buffer) => {
    try {
      const msg = JSON.parse(String(buf));
      if (msg.type === 'RUN') {
        const project = msg.project as Project;
        const engine = new Engine({
          WIP: 1e6,
          routes: Object.fromEntries(project.routes.map(r => [r.key, r.steps])),
          timeMap: Object.fromEntries(project.routes.map(r => [r.key, Object.fromEntries(r.steps.map(s=>[s,1]))])),
          able: Object.fromEntries(
            Array.from(new Set(project.routes.flatMap(r=>r.steps))).map(op => [
              op,
              project.layout.stations.filter(st => st.operations.includes(op)).map(st => st.id)
            ])
          ),
          stations: Object.fromEntries(project.layout.stations.map(st => [st.id, {
            id: st.id, m: st.capacity, busyUntil: Array(st.capacity).fill(0), queue: [], busySum: 0, doneCount: 0
          }])),
          orders: (project.scenario?.orders || []).map(o => ({ id: o.id, release: 0, funs: o.chosen }))
        } as any);
        const res = engine.run();
        const util = Object.fromEntries(Object.entries((res as any).stations).map(([id, s]: any) => [id, s.busySum]));
        socket.send(JSON.stringify({ type: 'RESULTS', makespan: (res as any).time||0, th: 0, ltAvg: 0, ltP90: 0, util }));
      }
    } catch (e: any) {
      socket.send(JSON.stringify({ type: 'ERROR', message: e?.message || 'Unknown error' }));
    }
  });
});

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`Backend running on :${port}`))
  .catch((err) => { app.log.error(err); process.exit(1); });
