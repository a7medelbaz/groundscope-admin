export interface GeneratedCredentials {
  email: string;
  password: string;
}

export function generateSupervisorEmail(serviceTypeSlug: string): string {
  const slug = serviceTypeSlug.toLowerCase().replace(/\s+/g, "_");
  return `supervisor.${slug}@groundscope.com`;
}

export function generateManagerEmail(unitSlug: string): string {
  const slug = unitSlug.toLowerCase().replace(/\s+/g, "_");
  return `manager.${slug}@groundscope.com`;
}

export function generatePassword(): string {
  const randomDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const specialChars = "!@#$%";
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
  return `GroundScope${randomDigits}${randomSpecial}`;
}

export function generateCredentials(
  role: "supervisor" | "unit_manager",
  identifier: string
): GeneratedCredentials {
  const email =
    role === "supervisor"
      ? generateSupervisorEmail(identifier)
      : generateManagerEmail(identifier);
  const password = generatePassword();
  return { email, password };
}
