import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class Tag {

  @PrimaryKey()
  id: number;

  @Property()
  @Unique()
  tag: string;

}
