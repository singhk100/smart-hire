import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Resume } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private base = `${environment.apiUrl}/resumes`;

  constructor(private http: HttpClient) {}

  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Resume>(`${this.base}/upload`, form);
  }

  getMyResumes() {
    return this.http.get<Resume[]>(this.base);
  }
}
