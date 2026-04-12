"use client"

import { useState } from "react"
import { createMouAgreement } from "@/lib/actions/ngoWorkflow"

export default function MouSigningPage() {
  const [mouUrl, setMouUrl] = useState("")
  const [resources, setResources] = useState("")
  const [partnerCorporateId, setPartnerCorporateId] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    setError("")
    try {
      await createMouAgreement({
        partnerCorporateId,
        mouDocumentUrl: mouUrl || undefined,
        resourceTypes: resources ? resources.split(",").map((r) => r.trim()).filter(Boolean) : undefined,
      })
      setStatus("success")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed."
      setError(msg === "NGO_ONLY" ? "This action is only available to NGO partners." : "Submission failed. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">MOU Signed</h2>
        <p className="text-gray-600">Your MOU agreement has been recorded. The Jenga365 team will review it shortly.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Sign MOU Agreement</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Corporate Partner ID</label>
          <input
            type="text"
            value={partnerCorporateId}
            onChange={(e) => setPartnerCorporateId(e.target.value)}
            placeholder="e.g. partner-uuid"
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">MOU Document URL</label>
          <input
            type="url"
            value={mouUrl}
            onChange={(e) => setMouUrl(e.target.value)}
            placeholder="https://docs.example.com/mou.pdf"
            className="w-full border rounded-md px-3 py-2"
          />
          <p className="text-xs text-gray-400 mt-1">Upload the document to your storage provider first, then paste the URL here.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Resource Types (comma-separated)</label>
          <input
            type="text"
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            placeholder="funding, equipment, mentorship_slots"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-blue-700 text-white py-2 rounded-md font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Sign & Submit MOU"}
        </button>
      </form>
    </div>
  )
}
