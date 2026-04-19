export interface Application {
  id: string;
  jobTitle: string;
  status: string;
  score: number;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  resumeId?: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
}

export interface ApplyJobDto {
  jobId: string;
  resumeId: string;
}

export interface UpdateApplicationStatusDto {
  applicationId: string;
  status: string;
}

export const APPLICATION_STATUSES = [
   'Applied',
   'Shortlisted',
   'Rejected',
   'inprocess'
];
