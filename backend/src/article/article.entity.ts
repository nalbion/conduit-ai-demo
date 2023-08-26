import {
  Collection,
  Entity,
  EntityDTO,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  wrap
} from '@mikro-orm/core';
import slug from 'slug';

import { User } from '../user/user.entity';
import { Comment } from './comment.entity';
import { Tag } from '../tag/tag.entity';

@Entity()
export class Article {

  @PrimaryKey()
  id: number;

  @Property()
  slug: string;

  @Property()
  title: string;

  @Property()
  description = '';

  @Property()
  body = '';

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToMany({ entity: () => Tag, owner: true, eager: true })
  tags = new Collection<Tag>(this);

  @ManyToOne()
  author: User;

  @ManyToMany({ entity: () => User })
  authors = new Collection<User>(this);

  @OneToMany(() => Comment, comment => comment.article, { eager: true, orphanRemoval: true })
  comments = new Collection<Comment>(this);

  @Property()
  favoritesCount = 0;

  /** username of the user who has the lock */
  @Property({ nullable: true })
  lockedBy: string;

  /** timestamp when the lock was acquired */
  @Property({ nullable: true })
  lockedAt: Date;

  constructor(author: User, title: string, description: string, body: string) {
    this.author = author;
    this.title = title;
    this.description = description;
    this.body = body;
    this.slug = slug(title, { lower: true }) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
  }

  toJSON(user?: User) {
    const o = wrap<Article>(this).toObject() as ArticleDTO;
    o.favorited = user && user.favorites.isInitialized() ? user.favorites.contains(this) : false;
    o.author = this.author.toJSON(user);

    if (user && o.authors?.some(author => author.id === user.id) ) {
      o.authorEmails = this.authors.getItems().map(author => author.email);
    }

    return o;
  }

}

export interface ArticleDTO extends EntityDTO<Article> {
  favorited?: boolean;
  tagList?: string[];
  authorEmails?: string[];
}
