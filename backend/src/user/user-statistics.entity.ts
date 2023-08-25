import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
// import {Article} from "../article/article.entity";

@Entity() // { tableName: 'user', readonly: true })
export class UserStatistics {

    @PrimaryKey()
    id: number;

    @Property()
    username: string;
    //
    // @OneToMany(() => Article, article => article.author, { hidden: true })
    // articles = new Collection<Article>(this);
    //
    // @Formula(alias => `(SELECT COUNT(a.id) FROM article a WHERE a.author_id = ${alias}.id)`)
    @Property()
    total_articles: number;

    // @Formula(alias => `(SELECT SUM(a.favorites_count) FROM article a WHERE a.author_id = ${alias}.id)`)
    @Property()
    total_likes: number;

    // @Formula(alias => `(SELECT MIN(a.created_at) FROM article a WHERE a.author_id = ${alias}.id)`)
    @Property()
    first_article_date: Date;
}
