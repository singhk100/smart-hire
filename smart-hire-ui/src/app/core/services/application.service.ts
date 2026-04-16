import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Application, ApplyJobDto, UpdateApplicationStatusDto } from '../models/application.model';

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

  updateStatus(dto: UpdateApplicationStatusDto) {
    return this.http.put<Application>(`${this.base}/status`, dto);
  }
}
