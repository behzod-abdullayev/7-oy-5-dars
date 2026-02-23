import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "./entities/article.entity";
import { In, Repository } from "typeorm";
import { Tag } from "../tags/entities/tag.entity";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articlerepo: Repository<Article>,
    @InjectRepository(Tag) private tagrepo: Repository<Tag>
) {}
async create(createArticleDto: CreateArticleDto, file: Express.Multer.File) {
    try {

      const tags = await this.tagrepo.findBy({
        id: In(createArticleDto.tags)
      })


      const article = this.articlerepo.create({
        ...createArticleDto,
        tags
      })

      article.backgroundImage = `http://localhost:4001/uploads/${file.filename}`
      return await this.articlerepo.save(article)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<Article[]> {
    try {
      return await this.articlerepo.find()
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

  async remove(id: number):  Promise<{message: string}> {
    try {
            const foundArticle = await this.articlerepo.findOne({where: {id}})

      if(!foundArticle) throw new NotFoundException("article not found")

        await this.articlerepo.delete(foundArticle.id)
        return {message: "article deleted"}
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
