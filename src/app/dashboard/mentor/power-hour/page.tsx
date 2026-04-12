"use client"

import { useState } from "react"
import { logPowerHourSession } from "@/lib/actions/powerHour"

export default function PowerHourPage() {
  const [menteeId, setMenteeId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [minutes, setMinutes] = useState(60)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ sessionId: string; month: string } | null>(null)

  // mentorId must come from session — inject via server component wrapper
  const mentorId = "" // TODO: populate from session in server wrapper

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (minutes < 1) { setError("Duration must be at least 1 minute."); return }
    setStatus("submitting"); setError("")
    try {
      const res = await logPowerHourSession({
        mentorId,
        menteeId: menteeId || undefined,
        sessionDate: new Date(date),
        durationMinutes: minutes,
        notes: notes || undefined,
      })
      setResult(res)
      setStatus("success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to log session.")
      setStatus("error")
    }
  }

  if (status === "success" && result) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Session Logged!</h2>
        <p className="text-gray-600">{minutes} minutes recorded for {result.month}. Keep up the great work!</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Log Power Hour Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Session Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input type="number" min={1} max={480} value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mentee ID (optional)</label>
          <input type="text" value={menteeId} onChange={(e) => setMenteeId(e.target.value)}
            placeholder="Leave blank for group sessions"
            className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="w-full border rounded-md px-3 py-2 resize-none" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={status === "submitting"}
          className="w-full bg-green-700 text-white py-2 rounded-md font-medium hover:bg-green-800 disabled:opacity-50">
          {status === "submitting" ? "Saving…" : "Log Session"}
        </button>
      </form>
    </div>
  )
}
