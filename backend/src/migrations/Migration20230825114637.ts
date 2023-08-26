import { Migration } from '@mikro-orm/migrations';

export class Migration20230825114637 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      CREATE VIEW user_statistics AS
      SELECT
        u.id AS user_id,
        u.username,
        IFNULL(COUNT(article.id), 0) AS total_articles,
        CAST(IFNULL(SUM(article.favorites_count), 0) AS UNSIGNED INT) AS total_likes,
        MIN(a.created_at) AS first_article_date
      FROM user u
      LEFT JOIN article AS a 
        ON u.id = a.author_id;
    `);
  }

  async down(): Promise<void> {
    // Drop the view
    this.addSql('DROP VIEW IF EXISTS user_statistics;');
  }

}
