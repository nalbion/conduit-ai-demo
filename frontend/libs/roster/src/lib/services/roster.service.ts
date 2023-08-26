import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/http-client/src';
import { UserStatisticsResponse } from '../../../../core/api-types/src';

@Injectable({ providedIn: 'root' })
export class RosterService {
  constructor(private apiService: ApiService) {}

  getUserStatistics(): Observable<UserStatisticsResponse> {
    return this.apiService.get<UserStatisticsResponse>('/users/statistics');
  }
}
