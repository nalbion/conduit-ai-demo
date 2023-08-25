import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class UserStatistics {

    @PrimaryKey()
    userId: number;

    @Property()
    username: string;

    @Property()
    totalArticles: number;

    @Property()
    totalLikes: number;

    @Property()
    firstArticleDate: Date;
}
