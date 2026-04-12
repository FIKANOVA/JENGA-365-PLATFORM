"use client"

import { useState } from "react"
import { logGiveBackActivity } from "@/lib/actions/giveBack"

const ACTIVITY_TYPES = [
  { value: "tree_planting", label: "Tree Planting" },
  { value: "book_drive", label: "Book Drive" },
  { value: "mentoring", label: "Peer Mentoring" },
  { value: "community_clean", label: "Community Clean-Up" },
  { value: "other", label: "Other" },
]

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export default function GiveBackPage() {
  const [activityType, setActivityType] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const quarter = getCurrentQuarter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activityType || !description.trim()) {
      setError("Please select an activity type and describe what you did.")
      return
    }
    setStatus("submitting")
    setError("")
    try {
      await logGiveBackActivity({ quarter, activityType, description })
      setStatus("success")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(message)
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Activity Logged!</h2>
        <p className="text-gray-600">Your Give Back activity for {quarter} has been recorded. Thank you for contributing to the community.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-1">Log Give Back Activity</h1>
      <p className="text-gray-500 mb-6 text-sm">Quarter: {quarter}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Activity Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          >
            <option value="">Select an activity…</option>
            {ACTIVITY_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Briefly describe what you did, where, and its impact…"
            className="w-full border rounded-md px-3 py-2 resize-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-green-700 text-white py-2 rounded-md font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Log Activity"}
        </button>
      </form>
    </div>
  )
}
