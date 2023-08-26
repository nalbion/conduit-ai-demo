import { DynamicFormComponent, Field, formsActions, ListErrorsComponent, ngrxFormsQuery } from '@realworld/core/forms';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { articleEditActions, articleQuery } from '@realworld/articles/data-access';
import { take, tap, filter } from 'rxjs';
import { JsonPipe } from '@angular/common';

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'title',
    placeholder: 'Article Title',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'description',
    placeholder: "What's this article about?",
    validator: [Validators.required],
  },
  {
    type: 'TEXTAREA',
    name: 'body',
    placeholder: 'Write your article (in markdown)',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'tagList',
    placeholder: 'Enter tags, separated by commas',
    validator: [],
  },
  {
    type: 'INPUT',
    name: 'authorEmails',
    placeholder: 'Enter author emails, separated by commas',
    validator: [],
  },
];

@UntilDestroy()
@Component({
  selector: 'cdt-article-edit',
  standalone: true,
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
  imports: [DynamicFormComponent, ListErrorsComponent, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent implements OnInit, OnDestroy {
  structure$ = this.store.select(ngrxFormsQuery.selectStructure);
  data$ = this.store.select(ngrxFormsQuery.selectData);
  private lockTimeout: any;


  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.store.dispatch(formsActions.setStructure({ structure }));

    this.store
      .select(articleQuery.selectData)
      .pipe(
          untilDestroyed(this),
          filter(article => article && !!article.slug)
      )
      .subscribe((article) => {
        this.store.dispatch(formsActions.setData({ data: article }));
        this.lockArticle(article.slug);
      });
  }

  updateForm(changes: any) {
    // NOTE: I don't think this is the best UX, but it's what the spec asks for.
    // const currentUserEmail =  email of the current user
    // if (changes.authors && !changes.authors.split(',').map(email => email.trim()).includes(currentUserEmail)) {
    //   alert("You cannot remove yourself from the authors' list.");
    //   return;
    // }

    this.store.dispatch(formsActions.updateData({ data: changes }));
  }

  submit() {
    this.store.dispatch(articleEditActions.publishArticle());
  }

  ngOnDestroy() {
    this.unlockArticle();
    this.store.dispatch(formsActions.initializeForm());
  }

  lockArticle(slug: string) {
    this.store.dispatch(articleEditActions.lockArticle({slug}));

    // Start a timer to automatically unlock the article after 5 minutes
    this.lockTimeout = setTimeout(() => this.unlockArticle(), 5 * 60 * 1000);
  }

  unlockArticle() {
    this.data$
      .pipe(
        take(1), // take the first emitted value and then complete
      )
      .subscribe(({slug}) => {
        if (slug) {
          this.store.dispatch(articleEditActions.unlockArticle({slug}));

          // Clear the lock timeout
          clearTimeout(this.lockTimeout);
        }
      });

    clearTimeout(this.lockTimeout);
  }
}
