import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser, IQuestionAndResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  updateQuestionsAndResponses(userId: string, questions: IQuestionAndResponse[]): Observable<IUser> {
    return this.http.put<{ success: boolean; data: IUser }>(`${this.apiUrl}/${userId}/questions`, {
      questionsAndResponses: questions
    }).pipe(
      map(response => response.data)
    );
  }

  getUserById(userId: string): Observable<IUser> {
    return this.http.get<{ success: boolean; data: IUser }>(`${this.apiUrl}/${userId}`).pipe(
      map(response => response.data)
    );
  }
}
