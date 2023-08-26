import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const articleEditActions = createActionGroup({
  source: 'Article Edit',
  events: {
    publishArticle: emptyProps(),
    publishArticleSuccess: emptyProps(),

    lockArticle: props<{ slug: string }>(),
    lockArticleSuccess: emptyProps(),
    lockArticleFailure: props<{ error: any }>(),

    unlockArticle: props<{ slug: string }>(),
    unlockArticleSuccess: emptyProps(),
    unlockArticleFailure: props<{ error: any }>(),
  },
});
