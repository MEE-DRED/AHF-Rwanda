export type Gender = 'Female' | 'Male';
export type Status = 'Pending' | 'Answered';
export type Respondent = 'AHF' | 'RBC' | 'UNAIDS' | 'Untracked';

export const GENDERS: Gender[] = ['Female', 'Male'];
export const RESPONDENTS: Respondent[] = ['AHF', 'RBC', 'UNAIDS', 'Untracked'];

export interface Question {
  id: string;
  nickname: string;
  gender: Gender;
  avatar: string;
  question: string;
  status: Status;
  answered_by: Respondent | null;
  created_at: string;
  updated_at: string;
}
