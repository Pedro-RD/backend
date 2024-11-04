import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Put,
  Query, BadRequestException
} from "@nestjs/common";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryParamsUsersDto } from "../query/query-params-users.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))
  findAll(@Query() query: QueryParamsUsersDto) {
    try {
      return this.usersService.findAll({
        page: query.page || 1,
        limit: query.limit || 10,
        orderBy: query.orderBy || 'id',
        order: query.order || 'ASC',
        search: query.search || '',
      });
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(+id);
  }
}
