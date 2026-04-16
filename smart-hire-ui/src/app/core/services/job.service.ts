import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateJobDto, Job } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private base = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Job[]>(this.base);
  }

  create(dto: CreateJobDto) {
    return this.http.post<Job>(this.base, dto);
  }
}
