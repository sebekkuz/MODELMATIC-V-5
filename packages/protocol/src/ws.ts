// WebSocket message protocol — type-safe
import type { Project } from '@prodsim/schemas';

export type ClientMsg =
  | { type: 'RUN'; project: Project };

export type ServerMsg =
  | { type: 'HELLO_OK'; server: string; version: string }
  | { type: 'RESULTS'; makespan: number; th: number; ltAvg: number; ltP90: number; util: Record<string, number> }
  | { type: 'ERROR'; message: string };

export type AnyMsg = ClientMsg | ServerMsg;

export function isClientMsg(m: AnyMsg): m is ClientMsg {
  return (m as ClientMsg).type === 'RUN';
}

export function isServerMsg(m: AnyMsg): m is ServerMsg {
  if (!m || typeof m !== 'object') {
    return false;
  }
  const type = (m as ServerMsg).type;
  return type === 'HELLO_OK' || type === 'RESULTS' || type === 'ERROR';
}

export function parseMsg(json: string): AnyMsg {
  return JSON.parse(json) as AnyMsg;
}

export function stringifyMsg(m: AnyMsg): string {
  return JSON.stringify(m);
}
