import { BaseEntity } from "src/database/base.entity";
import { Auth } from "src/module/auth/entities/auth.entity";
import { Tag } from "src/module/tags/entities/tag.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";


@Entity({ name: "article" })
export class Article extends BaseEntity {
    @Column({ length: 500, unique: true })
    heading: string;

    @Column({ type: "text" })
    body: string;

    @Column({ length: 500 })
    backgroundImage: string;

    @ManyToOne(() => Auth, (user) => user.articles, { cascade: false, nullable: false })
    @JoinTable({ name: "author_id" })
    author: Auth;

    @ManyToMany(() => Tag, (tag) => tag.articles)
    @JoinTable({ name: "article_id" })
    tags: Tag[]; 
}