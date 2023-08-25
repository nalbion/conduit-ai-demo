import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { EntityManager, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/mysql';
import { SECRET } from '../config';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './user.entity';
import { IUserRO } from './user.interface';
import { UserRepository } from './user.repository';
import { UserStatistics } from './user-statistics.entity';



@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(UserStatistics)
    private readonly userStatisticsRepository: EntityRepository<UserStatistics>,
    private readonly em: EntityManager,
  ) {}

  async getStatistics(): Promise<any[]> {
    return await this.userStatisticsRepository.findAll();
//     const qb = this.userStatisticsRepository
//           .createQueryBuilder('u')
//             .select(['u.*',
//                 // 'COUNT(a.id) as total_articles',
//                 // 'SUM(a.favorites_count) as total_likes',
//                 // 'MIN(a.created_at) as first_article_date',
//             ])
//           // .select(['u.*', 'u.id'])
//           // .addSelect(['u.username'])
//
// // .addSelect(['a.favorites_count'])
// //           .addSelect('COUNT(a.id) as total_articles')
// //         .addSelect('SUM(a.favorites_count) as total_likes')
// //         .addSelect('MIN(a.created_at) as first_article_date')
//         //
//
//             // .leftJoin('u.articles', 'a') // , 'user.id = article.author_id')
//         //   .leftJoinAndSelect('u.articles', 'a') // , 'user.id = article.author_id')
//
//
//         // .leftJoin('a.author', 'a') // , 'user.id = article.author_id')
//         // .count('article.id')
//         // .groupBy(['id'])
//         //     .groupBy(['u.id', 'u.username'])
//         // .orderBy({ 'total_likes': QueryOrder.DESC })
//     ;
//
//     return await qb.getResultList();
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(loginUserDto: LoginUserDto): Promise<User> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
    };

    return this.userRepository.findOne(findOneOptions);
  }

  async create(dto: CreateUserDto): Promise<IUserRO> {
    // check uniqueness of username/email
    const { username, email, password } = dto;
    const exists = await this.userRepository.count({ $or: [{ username }, { email }] });

    if (exists > 0) {
      throw new HttpException({
        message: 'Input data validation failed',
        errors: { username: 'Username and email must be unique.' },
      }, HttpStatus.BAD_REQUEST);
    }

    // create new user
    const user = new User(username, email, password);
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new HttpException({
        message: 'Input data validation failed',
        errors: { username: 'Userinput is not valid.' },
      }, HttpStatus.BAD_REQUEST);
    } else {
      await this.em.persistAndFlush(user);
      return this.buildUserRO(user);
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne(id);
    wrap(user).assign(dto);
    await this.em.flush();

    return this.buildUserRO(user);
  }

  async delete(email: string) {
    return this.userRepository.nativeDelete({ email });
  }

  async findById(id: number): Promise<IUserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      const errors = { User: ' not found' };
      throw new HttpException({ errors }, 401);
    }

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<IUserRO> {
    const user = await this.userRepository.findOneOrFail({ email });
    return this.buildUserRO(user);
  }

  generateJWT(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      email: user.email,
      exp: exp.getTime() / 1000,
      id: user.id,
      username: user.username,
    }, SECRET);
  }

  private buildUserRO(user: User) {
    const userRO = {
      bio: user.bio,
      email: user.email,
      image: user.image,
      token: this.generateJWT(user),
      username: user.username,
    };

    return { user: userRO };
  }
}
