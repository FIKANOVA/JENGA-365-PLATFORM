import { redirect } from "next/navigation";

// NGOs share the corporate-partner registration form but skip the
// milestone-tied "contribution model" step. The corporate page reads
// `?type=ngo` and pre-sets orgType so the form auto-skips step 2.
// Resource Exchange MOU is signed inside the NGO dashboard after sign-up.
export default function RegisterNgoPage() {
    redirect("/register/corporate?type=ngo");
}
