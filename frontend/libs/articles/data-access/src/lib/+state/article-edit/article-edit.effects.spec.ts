import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { Article } from '@realworld/core/api-types';
import { ArticlesService } from '../../services/articles.service';
import { articleEditActions } from './article-edit.actions';
import { publishArticle$ } from './article-edit.effects';

describe('ArticleEdit Effects', () => {
    class ArticleEditEffects {
        publishArticle$ = publishArticle$;
    }

    let effects: ArticleEditEffects;
    let actions$: ReplaySubject<Action>;
    let mockStore: MockStore;
    let mockArticlesService: jest.Mocked<ArticlesService>;
    let mockRouter: jest.Mocked<Router>;

    beforeEach(() => {
        mockArticlesService = {
            publishArticle: jest.fn(),
        } as any;

        mockRouter = {
            navigate: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            providers: [
                ArticleEditEffects,
                provideMockActions(() => actions$),
                provideMockStore(),
                { provide: ArticlesService, useValue: mockArticlesService },
                { provide: typeof publishArticle$, useClass: publishArticle$ },
                { provide: Router, useValue: mockRouter }
            ]
        });

        effects = TestBed.inject(ArticleEditEffects);
        mockStore = TestBed.inject(MockStore);
        actions$ = new ReplaySubject(1);
    });

    it.only('should call articlesService.publishArticle with the correct tagList', (done) => {
        // Given
        const action = articleEditActions.publishArticle();
        const inputState = {
            ngrxForms: {
                data: {
                    tagList: 'coding, testing'
                }
            }
        };

        mockStore.setState(inputState);

        const expectedArticle = {
            tagList: ['coding', 'testing']
        } as Article;

        // stub the publish response
        mockArticlesService.publishArticle.mockReturnValue(of({ article: expectedArticle }));

        // Invoke the effect function, then call `action$.next()` below
        const observableResult = effects.publishArticle$(actions$.asObservable(),
                                                                                    mockArticlesService,
                                                                                    mockStore,
                                                                                    mockRouter);

        observableResult.subscribe(() => {
            // Then
            expect(mockArticlesService.publishArticle).toHaveBeenCalledWith(expectedArticle);
            done();
        });

        // When (after invoking above)
        actions$.next(action);
    });
});
