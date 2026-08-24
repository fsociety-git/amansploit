import { customAlphabet } from "nanoid";

/**
 * Case IDs appear in a URL that gets pasted into WhatsApp groups, so they must
 * be short enough to read aloud and unguessable enough that nobody can enumerate
 * live cases. The alphabet drops 0/O/1/l/I to survive being retyped from a
 * screenshot. 8 characters over a 31-symbol alphabet is ~40 bits.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const newCaseId = customAlphabet(ALPHABET, 8);

/** Six characters, shown to the victim to post publicly. Readable, not secret. */
export const newVerificationCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);
