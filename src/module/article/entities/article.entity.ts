import { BaseEntity } from "src/database/base.entity";
import { Auth } from "src/module/auth/entities/auth.entity";
import { Tag } from "src/module/tags/entities/tag.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";


@Entity({ name: "article" })
export class Article extends BaseEntity {
    @Column({ length: 500, unique: true })
    heading: string;

    @Column({ type: "text" })
    body: string;

    @Column({ length: 500 })
    backgroundImage: string;

    @Column({default: true})
    isActive: boolean

    @DeleteDateColumn()
    deletedAt: Date

    @ManyToOne(() => Auth, (user) => user.articles, { cascade: false, nullable: false })
    @JoinColumn({ name: "author_id" })
    author: Auth;

    @ManyToMany(() => Tag, (tag) => tag.articles)
    @JoinTable()
    tags: Tag[]; 
}