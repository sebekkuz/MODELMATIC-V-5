import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { Engine } from '@prodsim/sim-engine';
import { Project as ProjectSchema } from '@prodsim/schemas';
import type { z } from 'zod';

type Project = z.infer<typeof ProjectSchema>;

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.CORS_ORIGIN || true });
await app.register(websocket);

app.get('/health', async () => ({ ok: true }));

app.get('/ws', { websocket: true }, (conn: any) => {
  const socket = conn.socket as any;
  socket.send(JSON.stringify({ type: 'HELLO_OK', server: 'backend', version: '1.0' }));
  socket.on('message', (buf: Buffer) => {
    try {
      const msg = JSON.parse(String(buf));
      if (msg.type === 'RUN') {
        const project = msg.project as Project;
        const engine = new Engine({
          WIP: 1e6,
          routes: Object.fromEntries((project.routes as any[]).map((r: any) => [r.key, r.steps])),
          timeMap: Object.fromEntries((project.routes as any[]).map((r: any) => [r.key, Object.fromEntries((r.steps as any[]).map((s: any)=>[s,1]))])),
          able: Object.fromEntries(
            Array.from(new Set((project.routes as any[]).flatMap((r: any)=> r.steps))).map((op: any) => [
              op,
              (project.layout.stations as any[]).filter((st: any) => (st.operations || []).includes(op)).map((st: any) => st.id)
            ])
          ),
          stations: Object.fromEntries((project.layout.stations as any[]).map((st: any) => [st.id, {
            id: st.id, m: st.capacity, busyUntil: Array(st.capacity).fill(0), queue: [], busySum: 0, doneCount: 0
          }])),
          orders: ((project.scenario?.orders || []) as any[]).map((o: any) => ({ id: o.id, release: 0, funs: o.chosen }))
        } as any);
        const res: any = engine.run();
        const util = Object.fromEntries(Object.entries(res.stations as any).map(([id, s]: any) => [id, (s as any).busySum]));
        socket.send(JSON.stringify({ type: 'RESULTS', makespan: res.time || 0, th: 0, ltAvg: 0, ltP90: 0, util }));
      }
    } catch (e: any) {
      socket.send(JSON.stringify({ type: 'ERROR', message: e?.message || 'Unknown error' }));
    }
  });
});

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`Backend running on :${port}`))
  .catch((err) => { console.error(err); process.exit(1); });
