import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDTO } from './dto/password-reset.dto';
import { QueryParamsUsersDto } from './dto/query-params-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({
        description: 'Returns a paginated list of users',
        example: {
            data: [
                {
                    id: 1,
                    email: 'test@email.com',
                    name: 'Mary',
                    phoneNumber: '+3512236598',
                    address: 'Far away',
                    postcode: '2800-900',
                    city: 'Faro',
                    fiscalId: '890909098',
                    nationality: 'Portuguese',
                    role: 'manager',
                    createdAt: '2024-11-18T12:10:23.211Z',
                    updatedAt: '2024-11-18T13:54:15.146Z',
                    residents: [],
                },
            ],
            page: 1,
            limit: 10,
            totalCount: 1,
            totalPages: 1,
        },
    })
    @Get()
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    )
    findAll(@Query() query: QueryParamsUsersDto) {
        return this.usersService.findAll({
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
            role: query.role,
        });
    }

    @ApiOkResponse({
        description: 'Returns a single user',
        example: {
            id: 1,
            email: 'test@email.com',
            name: 'Mary',
            phoneNumber: '+3512236598',
            address: 'Far away',
            postcode: '2800-900',
            city: 'Faro',
            fiscalId: '890909098',
            nationality: 'Portuguese',
            role: 'manager',
            createdAt: '2024-11-18T12:10:23.211Z',
            updatedAt: '2024-11-18T13:54:15.146Z',
            residents: [],
        },
    })
    @ApiNotFoundResponse({
        description: 'User not found',
        example: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
        },
    })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(+id);
    }

    @ApiCreatedResponse({
        description: 'Creates a new user',
        example: {
            id: 1,
            email: 'test@email.com',
            name: 'Mary',
            phoneNumber: '+3512236598',
            address: 'Far away',
            postcode: '2800-900',
            city: 'Faro',
            fiscalId: '890909098',
            nationality: 'Portuguese',
            role: 'manager',
            createdAt: '2024-11-18T12:10:23.211Z',
            updatedAt: '2024-11-18T13:54:15.146Z',
            residents: [],
        },
    })
    @Post()
    @UsePipes(ValidationPipe)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @ApiOkResponse({
        description: 'Updates a user',
        example: {
            id: 1,
            email: 'test@email.com',
            name: 'Mary',
            phoneNumber: '+3512236598',
            address: 'Far away',
            postcode: '2800-900',
            city: 'Faro',
            fiscalId: '890909098',
            nationality: 'Portuguese',
            role: 'manager',
            createdAt: '2024-11-18T12:10:23.211Z',
            updatedAt: '2024-11-18T13:54:15.146Z',
            residents: [],
        },
    })
    @ApiNotFoundResponse({
        description: 'User not found',
        example: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
        },
    })
    @Patch(':id')
    @UsePipes(ValidationPipe)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @ApiNoContentResponse({
        description: 'Password updated successfully',
    })
    @Patch(':id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UsePipes(ValidationPipe)
    resetPassword(@Param('id', ParseIntPipe) id: number, @Body() resetPasswordDto: ResetPasswordDTO) {
        return this.usersService.resetPassword(id, resetPasswordDto);
    }

    @ApiNoContentResponse({
        description: 'User deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
        example: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
        },
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(+id);
    }
}
