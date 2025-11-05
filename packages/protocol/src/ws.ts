// WebSocket message protocol — zod-inferred Project type
import { Project as ProjectSchema } from '@prodsim/schemas';
import type { z } from 'zod';

export type Project = z.infer<typeof ProjectSchema>;

export type ClientMsg = { type: 'RUN'; project: Project };

export type ServerMsg =
  | { type: 'HELLO_OK'; server: string; version: string }
  | { type: 'RESULTS'; makespan: number; th: number; ltAvg: number; ltP90: number; util: Record<string, number> }
  | { type: 'ERROR'; message: string };

export type AnyMsg = ClientMsg | ServerMsg;

export function isClientMsg(m: AnyMsg): m is ClientMsg {
  return (m as any).type === 'RUN';
}

export function isServerMsg(m: AnyMsg): m is ServerMsg {
  return !isClientMsg(m);
}

export function parseMsg(json: string): AnyMsg {
  return JSON.parse(json) as AnyMsg;
}

export function stringifyMsg(m: AnyMsg): string {
  return JSON.stringify(m);
}
