import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from "./query-params.dto";

export class QueryParamsUsersDto extends QueryParamsDto{
  @IsOptional()
  @IsString()
  @Matches(
    /^(id|email|name|phoneNumber|address|postcode|city|fiscalId|nationality)$/,
  )
  orderBy?: string;
}
