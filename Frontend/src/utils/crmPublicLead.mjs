/**
 * Submit a lead to the public CRM API (Vite: use VITE_CRM_* env vars).
 * Falls back to NEXT_PUBLIC_* if your build exposes them.
 */

function digitsOnly(value) {
  if (value == null || value === "") return "";
  return String(value).replace(/\D/g, "");
}

function getCrmEnv() {
  const companyCode =
    import.meta.env.VITE_CRM_COMPANY_CODE ||
    import.meta.env.NEXT_PUBLIC_CRM_COMPANY_CODE ||
    "NICKNAMEIN";
  const apiKey =
    import.meta.env.VITE_CRM_API_KEY || import.meta.env.NEXT_PUBLIC_CRM_API_KEY;
  const apiUrl =
    import.meta.env.VITE_CRM_API_URL ||
    import.meta.env.NEXT_PUBLIC_CRM_API_URL ||
    "http://localhost:10000/crm/public/create";
  return { companyCode, apiKey, apiUrl };
}

/**
 * @param {object} params
 * @param {object} params.formData - Registration form (firstName, email, phoneNo, etc.)
 * @param {'store'|'vendor'} params.registrationType
 * @param {string} [params.notesExtra] - Appended to notes
 * @returns {Promise<Response|null>} null if skipped (no API key)
 */
export async function submitRegistrationToCrm({
  formData,
  registrationType,
  notesExtra = "",
}) {
  const { companyCode, apiKey, apiUrl } = getCrmEnv();

  if (!apiKey) {
    console.warn(
      "[CRM] Skipping lead submit: set VITE_CRM_API_KEY (or NEXT_PUBLIC_CRM_API_KEY) in .env"
    );
    return null;
  }

  const name = (formData?.firstName || "").trim();
  const email = (formData?.email || "").trim().toLowerCase();
  const phone = digitsOnly(formData?.phoneNo);

  const typeLabel =
    registrationType === "store"
      ? "Store"
      : registrationType === "vendor"
        ? "Vendor"
        : "Registration";

  const notes = [
    `${typeLabel} registration via website.`,
    notesExtra ? String(notesExtra).trim() : "",
  ]
    .filter(Boolean)
    .join(" ");

  const payload = {
    clientName: name || "Website registration",
    contactPerson: name || "—",
    phone,
    email: email || "—",
    location: "—",
    notes,
    from: "Nickname shop Website",
    status: "New",
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-company-code": companyCode,
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `CRM API error ${response.status}: ${text || response.statusText}`
    );
  }

  return response;
}
