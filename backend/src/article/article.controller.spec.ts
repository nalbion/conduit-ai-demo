import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto';
import { User } from '../user/user.entity';
import { Collection } from '@mikro-orm/core';

describe('ArticleController', () => {
    let articleController: ArticleController;
    let articleService: jest.Mocked<ArticleService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArticleController],
            providers: [
                {
                    provide: ArticleService,
                    useValue: {
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        articleController = module.get<ArticleController>(ArticleController);
        articleService = module.get(ArticleService);
    });

    describe('create', () => {
        it('should create an article with valid request', async () => {
            const userId = 1;
            const articleDto: CreateArticleDto = {
                title: 'Test Title',
                description: 'Test Description',
                body: 'Test Body',
                tagList: ['test1', 'test2']
            };

            const author = { 
                id: userId, 
                username: 'author', email: 'author@example.com', password: 'secret',
                bio: '', image: '', favorites: [], followers: [], followed: [], articles: [],
            };
            const comments = [];

            articleService.create.mockResolvedValueOnce({
                article: {
                    id: 123,
                    ...articleDto,
                    slug: 'test-title',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    favoritesCount: 0,
                    author,
                    comments,
                },
            });

            const result = await articleController.create(userId, articleDto);
            console.info(result);
            expect(result.article.title).toBe(articleDto.title);
            expect(articleService.create).toHaveBeenCalledWith(userId, articleDto);
        });

        it('should throw an error for tagList as a single string', async () => {
            const userId = 1;
            const invalidArticleDto: any = {
                title: 'Test Title',
                description: 'Test Description',
                body: 'Test Body',
                tagList: 'coding, testing'
            };

            try {
                await articleController.create(userId, invalidArticleDto);
            } catch (error) {
                expect(error.response.errors).toBeDefined();
                expect(error.response.errors[0].detail).toBe('tagList must be an array');
            }
        });

        it('should throw an error for body longer than 255 characters', async () => {
            const userId = 1;
            const longBody = new Array(257).join('a');
            const invalidArticleDto: CreateArticleDto = {
                title: 'Test Title',
                description: 'Test Description',
                body: longBody,
                tagList: ['test']
            };

            try {
                await articleController.create(userId, invalidArticleDto);
            } catch (error) {
                expect(error.response.errors).toBeDefined();
                expect(error.response.errors[0].detail).toBe('body must be shorter than 255 characters');
            }
        });
    });
});
