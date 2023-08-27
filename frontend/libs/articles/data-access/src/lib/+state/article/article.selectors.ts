import { createSelector } from '@ngrx/store';
import { articleFeature } from './article.reducer';

export const { selectArticleState, selectComments, selectData, selectLoaded, selectLoading } = articleFeature;
export const getAuthorUsername = createSelector(selectData, (data) => data.author.username);

export const getAuthorUsernames = createSelector(selectData, (data) => data.authors.map((author) => author.username));

export const articleQuery = {
  selectArticleState,
  selectComments,
  selectData,
  selectLoaded,
  selectLoading,
  getAuthorUsername,
  getAuthorUsernames,
};
