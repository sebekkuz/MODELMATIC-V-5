import { useStore } from '../state/store'

export function StationEditor(){
  const selId = useStore(s=>s.selectedStationId);
  const st = useStore(s=> s.project.layout.stations.find(x=>x.id===selId));
  const update = useStore(s=> s.updateStation);
  if(!st) return <div>Wybierz stanowisko…</div>;
  return (
    <div>
      <label>Nazwa</label>
      <input value={st.name} onChange={e=> update({id:st.id, name:e.target.value})} />
      <label>Kolor (wizualizacja)</label>
      <input type="color" value={(st as any).color||'#6a8dd9'} onChange={e=> update({id:st.id, ...(st as any), color:e.target.value} as any)} />
    </div>
  );
}
