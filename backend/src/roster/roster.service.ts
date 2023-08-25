// import { Injectable } from '@nestjs/common';
// import { Article } from '../article/article.entity';
// import {UserRepository} from "../user/user.repository";
// import {EntityRepository} from '@mikro-orm/mysql';
// import {QueryOrder} from "@mikro-orm/core";

// @Injectable()
// export class RosterService {
//     constructor(
//         private readonly articleRepository: EntityRepository<Article>,
//         private readonly userRepository: UserRepository,
//         // private readonly em: EntityManager,
//     ) {}
//
//     async getStatistics(): Promise<any[]> {
//         const qb = this.userRepository.createQueryBuilder('user')
//             .select('user.username')
//             // .addSelect('COUNT(article.id)', 'total_articles')
//             .addSelect('SUM(article.favorites_count) as total_likes')
//             .addSelect('MIN(article.created_at) as first_article_date')
//
//             .leftJoin('article.author', 'article') // , 'user.id = article.author_id')
//             // .count('article.id')
//             .groupBy('user.username')
//             .orderBy({ 'total_likes': QueryOrder.DESC });
//
//         return await qb.getResultAndCount();
//     }
// }
