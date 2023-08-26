import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { formsActions, ngrxFormsQuery } from '@realworld/core/forms';
import { catchError, concatMap, map, of, tap } from 'rxjs';
import { ArticlesService } from '../../services/articles.service';
import { articleEditActions } from './article-edit.actions';

export const publishArticle$ = createEffect(
  (
    actions$ = inject(Actions),
    articlesService = inject(ArticlesService),
    store = inject(Store),
    router = inject(Router),
  ) => {
    return actions$.pipe(
      ofType(articleEditActions.publishArticle),
      concatLatestFrom(() => store.select(ngrxFormsQuery.selectData)),
      concatMap(([_, data]) => {
        // Ensure tagList is an array of strings
        const article = { ...data };
        if (typeof data.tagList === 'string') {
          article.tagList = data.tagList.split(/, */g);
        }
        if (typeof data.authorEmails === 'string') {
          article.authorEmails = data.authorEmails.split(/, */g);
        }

        return articlesService.publishArticle(article).pipe(
          tap((result) => router.navigate(['article', result.article.slug])),
          map(() => articleEditActions.publishArticleSuccess()),
          catchError((result) =>
            of(
              formsActions.setErrors({
                errors: result.error.errors.reduce(
                  (
                    out: Record<string, string>,
                    err: { detail: string; title: string; source: { pointer: string } },
                  ) => {
                    const space = err.detail.indexOf(' ');
                    out[err.detail.substring(0, space)] = err.detail.substring(space + 1);
                    return out;
                  },
                  {},
                ),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
