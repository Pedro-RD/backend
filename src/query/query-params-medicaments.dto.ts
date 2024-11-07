import { IsIn, IsInt, IsOptional, IsString, Matches } from "class-validator";
import { QueryParamsDto } from "./query-params.dto";
import { Transform } from "class-transformer";

export class QueryParamsMedicamentsDto extends QueryParamsDto{
  @IsOptional()
  @IsString()
  @Matches(
    /^(id|name|instructions|quantity|prescriptionQuantity)$/,
  )
  orderBy?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  residentId?: number;
}
