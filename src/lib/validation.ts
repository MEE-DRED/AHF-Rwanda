import { GENDERS, RESPONDENTS, type Gender, type Respondent, type Status } from './types';

export const NICKNAME_MAX = 40;
export const QUESTION_MAX = 5000; // sanity cap only; also enforced by the database

// Remove control characters (keeps newline and tab), normalise line endings.
function clean(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

export function avatarMatchesGender(avatar: string, gender: Gender): boolean {
  return gender === 'Female' ? /^f[1-6]$/.test(avatar) : /^m[1-6]$/.test(avatar);
}

export type SubmissionResult =
  | { ok: true; data: { nickname: string; gender: Gender; avatar: string; question: string } }
  | { ok: false; errors: Record<string, string> };

export function validateSubmission(body: unknown): SubmissionResult {
  const errors: Record<string, string> = {};
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const nickname = typeof b.nickname === 'string' ? clean(b.nickname).replace(/\s+/g, ' ') : '';
  const question = typeof b.question === 'string' ? clean(b.question) : '';
  const gender = b.gender;
  const avatar = typeof b.avatar === 'string' ? b.avatar : '';

  if (!nickname) errors.nickname = 'Please enter a nickname.';
  else if (nickname.length > NICKNAME_MAX) errors.nickname = `Nickname must be ${NICKNAME_MAX} characters or fewer.`;

  if (typeof gender !== 'string' || !GENDERS.includes(gender as Gender)) errors.gender = 'Please select your gender.';

  if (!avatar) errors.avatar = 'Please choose an avatar.';
  else if (!errors.gender && !avatarMatchesGender(avatar, gender as Gender)) errors.avatar = 'Please choose an avatar.';

  if (!question) errors.question = 'Please type your question.';
  else if (question.length > QUESTION_MAX) errors.question = 'Your question is too long. Please shorten it a little.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { nickname, gender: gender as Gender, avatar, question } };
}

export type UpdateResult =
  | { ok: true; data: { status: Status; answered_by: Respondent | null } }
  | { ok: false; error: string };

export function validateUpdate(body: unknown): UpdateResult {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (b.status === 'Pending') return { ok: true, data: { status: 'Pending', answered_by: null } };
  if (b.status === 'Answered') {
    // Answered with no respondent recorded is saved as "Untracked".
    const raw = typeof b.answered_by === 'string' && b.answered_by ? b.answered_by : 'Untracked';
    if (!RESPONDENTS.includes(raw as Respondent)) return { ok: false, error: 'Invalid respondent.' };
    return { ok: true, data: { status: 'Answered', answered_by: raw as Respondent } };
  }
  return { ok: false, error: 'Invalid status.' };
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
