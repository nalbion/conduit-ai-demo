import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article, Profile } from '@realworld/core/api-types';

@Component({
  selector: 'cdt-author-meta',
  standalone: true,
  templateUrl: './author-meta.component.html',
  styleUrls: ['./author-meta.component.css'],
  imports: [RouterModule, CommonModule],
})
export class AuthorMetaComponent {
  @Input() article!: Article;
  @Input() author!: Profile;
  @Input() canModify!: boolean;
  @Input() primary: boolean = false;

  @Output() follow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfollow: EventEmitter<string> = new EventEmitter<string>();
  @Output() unfavorite: EventEmitter<string> = new EventEmitter();
  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() delete: EventEmitter<string> = new EventEmitter();

  toggleFavorite() {
    if (this.article.favorited) {
      this.unfavorite.emit(this.article.slug);
    } else {
      this.favorite.emit(this.article.slug);
    }
  }

  toggleFollow() {
    if (this.article.author.following) {
      this.unfollow.emit(this.article.author.username);
    } else {
      this.follow.emit(this.article.author.username);
    }
  }

  deleteArticle() {
    this.delete.emit(this.article.slug);
  }
}
