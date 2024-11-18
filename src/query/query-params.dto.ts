import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryParamsDto {
    @ApiProperty({
        description: 'Page number',
        default: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiProperty({
        description: 'Number of items per page',
        default: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiProperty({
        description: 'Order by field',
        default: 'ASC',
        required: false,
        oneOf: [
            { type: 'ASC', description: 'Ascending' },
            { type: 'DESC', description: 'Descending' },
        ],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC';

    @ApiProperty({
        description: 'Search by field',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;
}
