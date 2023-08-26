import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article, Profile } from '@realworld/core/api-types';

@Component({
  selector: 'cdt-author-meta-simple',
  standalone: true,
  templateUrl: './author-meta-simple.component.html',
  styleUrls: ['./author-meta-simple.component.css'],
  imports: [RouterModule, CommonModule],
})
export class AuthorMetaSimpleComponent {
  @Input() article!: Article;
  @Input() author!: Profile;
  @Input() primary: boolean = false;

  @Output() favorite: EventEmitter<string> = new EventEmitter();
  @Output() unfavorite: EventEmitter<string> = new EventEmitter();

  toggleFavorite(article: Article) {
    if (article.favorited) {
      this.unfavorite.emit(article.slug);
    } else {
      this.favorite.emit(article.slug);
    }
  }
}
