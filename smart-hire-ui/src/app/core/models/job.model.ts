export interface Job {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  recruiterId?: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  skillsRequired: string[];
}
