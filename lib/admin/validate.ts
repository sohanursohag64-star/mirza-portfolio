import type { Field } from "./types";

export function validate(fields: Field[], values: Record<string, any>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.name];
    const empty = v === undefined || v === null || String(v).trim() === "";
    if (f.required && empty) errors[f.name] = `${f.label} is required.`;
    else if (!empty && f.type === "email" && !/^\S+@\S+\.\S+$/.test(String(v)))
      errors[f.name] = "Enter a valid email address.";
    else if (!empty && f.type === "url" && !/^https?:\/\/\S+$/.test(String(v)))
      errors[f.name] = "Enter a full URL starting with http:// or https://.";
    else if (!empty && f.type === "number" && Number.isNaN(Number(v)))
      errors[f.name] = "Enter a number.";
  }
  return errors;
}
