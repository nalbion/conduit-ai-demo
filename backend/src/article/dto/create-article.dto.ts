import { IsString, IsArray, ArrayNotEmpty, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)  // Max length based on the database schema
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly body: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly tagList: string[];
}
