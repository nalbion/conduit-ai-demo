import { Migration } from '@mikro-orm/migrations';

export class Migration20230826054909 extends Migration {

  async up(): Promise<void> {
    // Create the new join table for the many-to-many relationship
    this.addSql(`
      CREATE TABLE article_authors
      (
        article_id INT UNSIGNED NOT NULL,
        user_id  INT UNSIGNED NOT NULL,
        PRIMARY KEY (article_id, user_id),
        FOREIGN KEY (article_id) REFERENCES article (id),
        FOREIGN KEY (user_id) REFERENCES user (id)
      );
    `);

    // Populate the new join table with existing article.author_id values
    this.addSql(`
      INSERT INTO article_authors (article_id, user_id)
      SELECT id, user_id
      FROM article;
    `);

    this.addSql(`
      ALTER TABLE article ADD COLUMN locked_by VARCHAR(255) NULL;
      ALTER TABLE article ADD COLUMN locked_at DATETIME NULL;
    `);
  }
}
