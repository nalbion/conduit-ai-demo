import {ForbiddenException, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {EntityManager, QueryOrder, wrap} from '@mikro-orm/core';
import {InjectRepository} from '@mikro-orm/nestjs'
import {EntityRepository} from '@mikro-orm/mysql';

import {User} from '../user/user.entity';
import {Article, ArticleDTO} from './article.entity';
import {IArticleRO, IArticlesRO, ICommentsRO} from './article.interface';
import {Comment} from './comment.entity';
import {CreateArticleDto, CreateCommentDto} from './dto';
import {Tag} from '../tag/tag.entity';
import autoMockOff = jest.autoMockOff;

@Injectable()
export class ArticleService {

  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Article)
    private readonly articleRepository: EntityRepository<Article>,
    @InjectRepository(Comment)
    private readonly commentRepository: EntityRepository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: EntityRepository<Tag>,
  ) {}

  async findAll(userId: number, query: any): Promise<IArticlesRO> {
    const user = userId ? await this.userRepository.findOne(userId, { populate: ['followers', 'favorites'] }) : undefined;
    const qb = this.articleRepository
      .createQueryBuilder('a')
      .select('a.*')
      .leftJoin('a.author', 'u')
      .leftJoinAndSelect('a.authors', 'authors')
      .leftJoinAndSelect('a.tags', 't');

    if ('tag' in query) {
      qb.andWhere(
          `a.id IN (
            SELECT article_id FROM article_tags WHERE tag_id IN (
              SELECT id FROM tag WHERE tag = ?
            )
          )`,
          [query.tag]
      );
    }

    if ('author' in query) {
      const author = await this.userRepository.findOne({ username: query.author });

      if (!author) {
        return { articles: [], articlesCount: 0 };
      }

      qb.andWhere({ author: author.id });
    }

    if ('favorited' in query) {
      const author = await this.userRepository.findOne({ username: query.favorited }, { populate: ['favorites'] });

      if (!author) {
        return { articles: [], articlesCount: 0 };
      }

      const ids = author.favorites.$.getIdentifiers();
      qb.andWhere({ author: ids });
    }

    qb.orderBy({ createdAt: QueryOrder.DESC });
    const res = await qb.clone().count('id', true).execute('get');
    const articlesCount = res ? res.count : 0;

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    const articles = await qb.getResult();
    return { articles: articles.map(a => this.mapToDto(a, user)), articlesCount };
  }

  // TODO: check when tagList needs to be loaded & mapped. Currently it seems that it is for GET /api/articles
  private mapToDto(article: Article, user: User): ArticleDTO {
    // replace tags with tagList
    const { tags, ...rest } = article.toJSON(user);

    return {
      ...rest,
      tagList: tags.map(t => t.tag),
    } as ArticleDTO
  }

  async findFeed(userId: number, query): Promise<IArticlesRO> {
    const user = userId ? await this.userRepository.findOne(userId, { populate: ['followers', 'favorites'] }) : undefined;
    const res = await this.articleRepository.findAndCount({ author: { followers: userId } }, {
      populate: ['author', 'authors'],
      orderBy: { createdAt: QueryOrder.DESC },
      limit: query.limit,
      offset: query.offset,
    });

    return { articles: res[0].map(a => this.mapToDto(a, user)), articlesCount: res[1] };
  }

  async findOne(userId: number, where, ): Promise<IArticleRO> {
    const user = userId ? await this.userRepository.findOneOrFail(userId, { populate: ['followers', 'favorites'] }) : undefined;
    const article = await this.articleRepository.findOne(where, { populate: ['author', 'authors'] });
    return { article: article && this.mapToDto(article, user) };
  }

  async addComment(userId: number, slug: string, dto: CreateCommentDto) {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const author = await this.userRepository.findOneOrFail(userId);
    const comment = new Comment(author, article, dto.body);
    await this.em.persistAndFlush(comment);

    return { comment, article: article.toJSON(author) };
  }

  async deleteComment(userId: number, slug: string, id: number): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const user = await this.userRepository.findOneOrFail(userId);
    const comment = this.commentRepository.getReference(id);

    if (article.comments.contains(comment)) {
      article.comments.remove(comment);
      await this.em.removeAndFlush(comment);
    }

    return { article: article.toJSON(user) };
  }

  async favorite(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const user = await this.userRepository.findOneOrFail(id, { populate: ['favorites', 'followers'] });

    if (!user.favorites.contains(article)) {
      user.favorites.add(article);
      article.favoritesCount++;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async unFavorite(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const user = await this.userRepository.findOneOrFail(id, { populate: ['followers', 'favorites'] });

    if (user.favorites.contains(article)) {
      user.favorites.remove(article);
      article.favoritesCount--;
    }

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async findComments(slug: string): Promise<ICommentsRO> {
    const article = await this.articleRepository.findOne({ slug }, { populate: ['comments'] });
    // TODO: tags for the articles for every comment are provided, as { id, tag }
    return { comments: article.comments.getItems() };
  }

  async create(userId: number, dto: CreateArticleDto) {
    const user = await this.userRepository.findOne({ id: userId }, { populate: ['followers', 'favorites', 'articles'] });
    const article = new Article(user, dto.title, dto.description, dto.body);

    // article.tagList.push(...dto.tagList);
    article.tags.set(await this.updateTags(dto.tagList));

    // Add authors by email
    const authorEmails = [...new Set([...dto.authorEmails, user.email])];
    const authors = await this.userRepository.find({ email: { $in: authorEmails } });
    article.authors.set(authors);

    // TODO: remove now that we have multiple authors
    user.articles.add(article);
    await this.em.flush();

    const articleDto = article.toJSON(user);
    articleDto.tagList = dto.tagList;

    return { article: articleDto };
  }

  async update(userId: number, slug: string, articleData: any): Promise<IArticleRO> {
    const user = await this.userRepository.findOne({ id: userId }, { populate: ['followers', 'favorites', 'articles'] });
    const article = await this.articleRepository.findOne({ slug }, { populate: ['author', 'authors'] });

    // Don't allow updates while locked by another user.
    if (article.lockedBy != user.username) {
      const lockedAt = new Date(article.lockedAt).getTime();
      if (Date.now() < lockedAt + 5 * 60000) {
        throw new HttpException('Article is locked', HttpStatus.FORBIDDEN)
      }
    }

    articleData.lockedBy = null;
    articleData.lockedAt = null;

    // TODO: do we need to call updateTags() here also?
    wrap(article).assign(articleData);

    // Update authors list to make sure current user is always in the list
    // TODO: the front-end displays extra buttons etc for the primary author, so probably need to make sure that the primary author is not removed.
    const authorEmails = [...new Set([...articleData.authorEmails, user.email])]; // add current user email if not already in the list
    const authors = await this.userRepository.find({ email: { $in: authorEmails } });
    article.authors.set(authors);

    await this.em.flush();

    return { article: article.toJSON(user) };
  }

  async delete(slug: string) {
    return this.articleRepository.nativeDelete({ slug });
  }

  private async updateTags(tagList: string[]) {
    const tags = await this.tagRepository.find({ tag: { $in: tagList } });
    const existingTags = tags.map(t => t.tag);
    const newTags = tagList.filter(t => !existingTags.includes(t));
    const newTagEntities = newTags.map(t => {
      const tag = new Tag();
      tag.tag = t;
      return tag;
    });

    // await this.tagRepository.persistAndFlush(newTagEntities);

    return [...tags, ...newTagEntities];
  }

  async lock(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const user = await this.userRepository.findOneOrFail(id);

    // Check if the user is authorized to lock the article
    if (!article.authors.getItems().some(a => a.id === user.id)) {
      throw new ForbiddenException('You are not authorized to lock this article.');
    }

    // Lock the article
    article.lockedBy = user.username;
    article.lockedAt = new Date();

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

  async unlock(id: number, slug: string): Promise<IArticleRO> {
    const article = await this.articleRepository.findOneOrFail({ slug }, { populate: ['author', 'authors'] });
    const user = await this.userRepository.findOneOrFail(id);

    // Check if the user is authorized to unlock the article
    if (!article.authors.getItems().some(a => a.id === user.id)) {
      throw new ForbiddenException('You are not authorized to unlock this article.');
    }

    // Unlock the article
    article.lockedBy = null;
    article.lockedAt = null;

    await this.em.flush();
    return { article: article.toJSON(user) };
  }

}
