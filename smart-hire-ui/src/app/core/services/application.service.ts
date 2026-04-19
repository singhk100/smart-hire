import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Application, ApplyJobDto, CandidateProfile, UpdateApplicationStatusDto } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private base = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  apply(dto: ApplyJobDto) {
    return this.http.post<Application>(`${this.base}/apply`, dto);
  }

  getMyApplications() {
    return this.http.get<Application[]>(`${this.base}/myapplication`);
  }

  getRecruiterApplications() {
    return this.http.get<Application[]>(`${this.base}/recruiter`);
  }

  getCandidateProfile(candidateId: string) {
    return this.http.get<CandidateProfile>(`${this.base}/recruiter/candidates/${candidateId}`);
  }

  updateStatus(dto: UpdateApplicationStatusDto) {
    return this.http.put<Application>(`${this.base}/status`, dto);
  }

  deleteMyApplication(applicationId: string) {
    return this.http.delete<string>(`${this.base}/${applicationId}`);
  }
}
