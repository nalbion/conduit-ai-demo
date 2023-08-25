import { Migration } from '@mikro-orm/migrations';

export class Migration20230824163219 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `article_tags` (`article_id` int unsigned not null, `tag_id` int unsigned not null, primary key (`article_id`, `tag_id`)) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `article_tags` add index `article_tags_article_id_index`(`article_id`);');
    this.addSql('alter table `article_tags` add index `article_tags_tag_id_index`(`tag_id`);');

    this.addSql('alter table `article_tags` add constraint `article_tags_article_id_foreign` foreign key (`article_id`) references `article` (`id`) on update cascade on delete cascade;');
    this.addSql('alter table `article_tags` add constraint `article_tags_tag_id_foreign` foreign key (`tag_id`) references `tag` (`id`) on update cascade on delete cascade;');

    this.addSql('alter table `tag` add unique `tag_tag_unique`(`tag`);');

    // Insert tags from article.tagList
    this.addSql(`
      INSERT IGNORE INTO tag (tag)
      SELECT DISTINCT TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', 1))
      FROM article
      WHERE article.tag_list LIKE '%,%'
        AND TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', 1)) NOT IN (SELECT tag FROM tag);
    `);
    this.addSql(`
      INSERT IGNORE INTO tag (tag)
      SELECT DISTINCT TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', -1))
      FROM article
      WHERE article.tag_list LIKE '%,%'
        AND TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', -1)) NOT IN (SELECT tag FROM tag);
    `);

    // Populate article_tags table
    this.addSql(`
      INSERT INTO article_tags (article_id, tag_id)
      SELECT article.id, tag.id
      FROM article
      JOIN tag ON tag.tag = TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', 1))
      WHERE article.tag_list LIKE '%,%'
    `);
    this.addSql(`
        INSERT INTO article_tags (article_id, tag_id)
        SELECT article.id, tag.id
        FROM article
        JOIN tag ON tag.tag = TRIM(BOTH ' ' FROM SUBSTRING_INDEX(article.tag_list, ',', -1))
        WHERE article.tag_list LIKE '%,%';
    `);

    this.addSql('alter table `article` drop `tag_list`;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `article_tags`;');

    this.addSql('alter table `article` add `tag_list` text not null;');

    this.addSql('alter table `tag` drop index `tag_tag_unique`;');
  }

}
