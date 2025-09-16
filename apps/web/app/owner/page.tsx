import { api } from '@/lib/api'

async function getReservations() {
  try {
    const { data } = await api.get('/owner/reservations', { headers: { 'X-Demo-Role': 'OWNER', 'X-Demo-User': 'demo-user' } })
    return data as any[]
  } catch {
    return []
  }
}

export default async function Owner() {
  const list = await getReservations()
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Owner Calendar (demo)</h1>
      <ul className="space-y-2">
        {list.map((r, i) => (
          <li key={i} className="bg-white rounded-2xl border p-4">
            <div className="font-mono text-sm">{r.startsAt}</div>
            <div>Party: {r.partySize} — Status: {r.status}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
