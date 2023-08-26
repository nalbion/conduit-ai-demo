import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '@realworld/core/api-types';
import {
  AuthorMetaSimpleComponent
} from "@realworld/articles/feature-articles-list/src/lib/author-meta-simple/author-meta-simple.component";
import {AuthorMetaComponent} from "@realworld/articles/feature-article/src/lib/author-meta/author-meta.component";
@Component({
  selector: 'cdt-article-list-item',
  standalone: true,
  templateUrl: './article-list-item.component.html',
  styleUrls: ['./article-list-item.component.css'],
  imports: [CommonModule, RouterModule, AuthorMetaSimpleComponent, AuthorMetaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListItemComponent {
  @Input() article!: Article;

  @Output() navigateToArticle: EventEmitter<string> = new EventEmitter();
  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() unfavorite: EventEmitter<string> = new EventEmitter();

  onFavorite(slug: string) {
    this.favorite.emit(slug);
  }

  onUnfavorite(slug: string) {
    this.unfavorite.emit(slug);
  }
}
