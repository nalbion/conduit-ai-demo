import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { RosterComponent } from './roster.component';

export const ROSTER_ROUTES: Routes = [
  {
    path: '',
    component: RosterComponent,
    // providers: [provideState(articleListFeature), provideEffects(articleListEffects, articlesEffects)],
  },
];
