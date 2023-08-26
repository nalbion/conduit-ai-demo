import { Component, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '@realworld/core/api-types';
import {AuthorMetaComponent} from "@realworld/articles/feature-article/src/lib/author-meta/author-meta.component";
@Component({
  selector: 'cdt-article-meta',
  standalone: true,
  templateUrl: './article-meta.component.html',
  styleUrls: ['./article-meta.component.css'],
  imports: [RouterModule, CommonModule, AuthorMetaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleMetaComponent {
  @Input() article!: Article;
  @Input() isAuthenticated!: boolean;
  @Input() canModify!: boolean;

  @Output() follow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfollow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfavorite: EventEmitter<string> = new EventEmitter();
  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() delete: EventEmitter<string> = new EventEmitter();

  onFollow(slug: string) {
    this.follow.emit(slug);
  }

  onUnfollow(slug: string) {
    this.unfollow.emit(slug);
  }

  onFavorite(slug: string) {
    this.favorite.emit(slug);
  }

  onUnfavorite(slug: string) {
    this.unfavorite.emit(slug);
  }

  onDelete(slug: string) {
    this.delete.emit(slug);
  }
}
