import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, Length } from "class-validator";

export class CreateArticleDto {
    @IsString()
    @Length(2, 500)
    @ApiProperty({default: "CSS"})
    heading: string;

@IsString()
@Length(20, 20000)
@ApiProperty({default: "CSSfhgjfngbhdhgnj njghdh"})
    body: string;


    @IsArray()
    @ApiProperty({example: [1, 2, 3]})
    tags: number[]
}


