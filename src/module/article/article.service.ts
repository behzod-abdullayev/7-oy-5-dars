import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "./entities/article.entity";
import { In, Repository } from "typeorm";
import { Tag } from "../tags/entities/tag.entity";
import { QueryDto } from "./dto/query.dto";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articlerepo: Repository<Article>,
    @InjectRepository(Tag) private tagrepo: Repository<Tag>
) {}
async create(createArticleDto: CreateArticleDto, file: Express.Multer.File, userId: any): Promise<Article> {
    try {

      const tags = await this.tagrepo.findBy({
        id: In(createArticleDto.tags)
      })

      console.log(tags);
      

      const article = this.articlerepo.create({
        ...createArticleDto,
        tags,
        author: userId
      })

      article.backgroundImage = `http://localhost:4001/uploads/${file.filename}`
      return await this.articlerepo.save(article)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

async findAll(query: QueryDto): Promise<Article[]> {
    try {

      const {page = 1, limit = 10, search} = query

      const createBuilder = await this.articlerepo.createQueryBuilder("article")
      .leftJoinAndSelect("article.tags", "tags")
      .leftJoinAndSelect("article.author", "author")
      .where("article.isActive = :isActive", {isActive: true})
      .andWhere("article.deletetAt is null")

      return await this.articlerepo.find({
       relations: ["tags", "author"]
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllMyArticles(userId): Promise<Article[]> {
    try {

      const articles = await this.articlerepo.find({where: {author: userId}, relations: ["tags", "author"]})
      return articles
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number): Promise<Article> {
    try {
      const foundArticle = await this.articlerepo.findOne({where: {id}})

      if(!foundArticle) throw new NotFoundException("article not found")
        return foundArticle
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // async update(id: number, updateArticleDto: UpdateArticleDto): Promise<{message: string}> {
  //   try {
  //     const foundArticle = await this.articlerepo.findOne({where: {id}})

  //     if(!foundArticle) throw new NotFoundException("article not found")

  //       await this.articlerepo.update(foundArticle.id, updateArticleDto)
  //       return {message: "article updated"}
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async remove(id: number, userId):  Promise<{message: string}> {
    try {
            const foundArticle = await this.articlerepo.findOne({where: {id}})

      if(!foundArticle) throw new NotFoundException("article not found")

        await this.articlerepo.softDelete(foundArticle.id)
        return {message: "article deleted"}
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
