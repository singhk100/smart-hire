export interface Application {
  id: string;
  jobTitle: string;
  status: string;
  score: number;
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
  'Pending',
  'Reviewed',
  'Accepted',
  'Rejected'
];
