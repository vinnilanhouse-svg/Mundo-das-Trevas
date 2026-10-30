export const PRIVACY_VERSION = "2026-10-30.1";
export const CONSENT_KEY = "arquivo-trevas-privacy-v1";
export const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;
export const PRIVACY_CONTROLLER = "Elemental Corp.";
export const PRIVACY_UPDATED = "30 de outubro de 2026";

export function createPrivacyChoice(analytics, now = Date.now()) {
  return {
    version: PRIVACY_VERSION,
    necessary: true,
    analytics: analytics === true,
    decidedAt: now,
    expiresAt: now + CONSENT_LIFETIME,
  };
}

export function validPrivacyChoice(choice, now = Date.now()) {
  return Boolean(
    choice &&
    choice.version === PRIVACY_VERSION &&
    choice.necessary === true &&
    typeof choice.analytics === "boolean" &&
    Number.isSafeInteger(choice.decidedAt) &&
    Number.isSafeInteger(choice.expiresAt) &&
    choice.decidedAt <= now &&
    choice.expiresAt > now &&
    choice.expiresAt - choice.decidedAt === CONSENT_LIFETIME,
  );
}

export function readPrivacyChoice(storage, now = Date.now()) {
  try {
    const choice = JSON.parse(storage.getItem(CONSENT_KEY));
    return validPrivacyChoice(choice, now) ? choice : null;
  } catch {
    return null;
  }
}

export function storePrivacyChoice(storage, choice) {
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify(choice));
    return true;
  } catch {
    return false;
  }
}

export const analyticsAllowed = (choice, now = Date.now()) =>
  validPrivacyChoice(choice, now) && choice.analytics;
