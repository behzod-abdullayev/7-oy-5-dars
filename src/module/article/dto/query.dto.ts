import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class QueryDto {
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({default:1, minimum: 1})
    page?: number = 1

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    @ApiProperty({default:1, minimum: 1, maximum: 100})
    limit?: number = 10


    @IsNumber()
    @IsOptional()
    @ApiProperty({default:1, minimum: 1, maximum: 100})
    search?: number 
}