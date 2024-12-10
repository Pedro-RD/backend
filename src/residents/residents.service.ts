import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { Role } from '../enums/roles.enum';
import PagedResponse from '../interfaces/paged-response.interface';
import QueryParams from '../interfaces/query-params.interface';
import { User } from '../users/entities/user.entity';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { Resident } from './entities/resident.entity';
import Mobility from './enums/mobility.enum';
import * as fs from 'fs';
import * as path from 'path';

interface EnvironmentVariables {
    NUMBER_OF_BEDS: number;
    MONTHLY_FEE: number;
    EXTRA_BEDRIDDEN: number;
    EXTRA_WHEELCHAIR: number;
    EXTRA_CANE: number;
}

@Injectable()
export class ResidentsService {
    logger = new Logger(ResidentsService.name);

    constructor(
        @InjectRepository(Resident)
        private readonly residentsRepository: Repository<Resident>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private configService: ConfigService<EnvironmentVariables>,
    ) {
        this.logger.log('Environment variables', JSON.stringify(this.configService.get('NUMBER_OF_BEDS')));
        this.logger.log('Environment variables', JSON.stringify(this.configService.get('MONTHLY_FEE')));
        this.logger.log('Environment variables', JSON.stringify(this.configService.get('EXTRA_BEDRIDDEN')));
        this.logger.log('Environment variables', JSON.stringify(this.configService.get('EXTRA_WHEELCHAIR')));
        this.logger.log('Environment variables', JSON.stringify(this.configService.get('EXTRA_CANE')));
    }

    async create(createResidentDto: CreateResidentDto) {
        this.logger.log(
            'Creating resident',
            JSON.stringify({
                ...createResidentDto,
            }),
        );

        let relatives = [];

        await this.checkIfBedIsAvailable(createResidentDto.bedNumber);

        if (createResidentDto.relatives) {
            relatives = await this.usersRepository.find({
                where: { id: In(createResidentDto.relatives) },
            });
        }

        if (createResidentDto.relatives && relatives.length !== createResidentDto.relatives.length) {
            this.logger.error('One or more relatives do not exist', JSON.stringify(createResidentDto.relatives), JSON.stringify(relatives));
            throw new NotFoundException('One or more relatives do not exist');
        }

        relatives.forEach((relative) => {
            if (relative.role !== Role.Relative) {
                this.logger.error('One or more users are not relatives', JSON.stringify(createResidentDto.relatives), JSON.stringify(relatives));
                throw new NotFoundException('One or more users are not relatives');
            }
        });

        const resident = this.residentsRepository.create({
            ...createResidentDto,
            relatives,
        });

        const newResident = await this.residentsRepository.save(resident);
        this.logger.log('Resident created', JSON.stringify(newResident));
        return {
            ...plainToClass(Resident, newResident),
            monthlyFee: this.calculateTotalFee(newResident.mobility),
        };
    }

    async findAll({ page, limit, orderBy, order, search }: QueryParams): Promise<PagedResponse<Resident>> {
        this.logger.log('Finding all residents', JSON.stringify({ page, limit, orderBy, order, search }));
        const queryBuilder = this.residentsRepository.createQueryBuilder('resident');
        queryBuilder.leftJoinAndSelect('resident.relatives', 'relative');

        if (search) {
            queryBuilder.where(
                'resident.name ILIKE :search OR resident.fiscalId ILIKE :search OR resident.specificCare ILIKE :search OR resident.nationality ILIKE :search OR resident.dietRestrictions ILIKE :search OR resident.allergies ILIKE :search',
                {
                    search: `%${search}%`,
                },
            );
        }

        const [residents, totalCount] = await queryBuilder
            .orderBy(`resident.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        this.logger.log('Residents found', JSON.stringify(residents), 'Total count', totalCount);

        return {
            data: residents.map((resident) => ({
                ...plainToClass(Resident, resident),
                monthlyFee: this.calculateTotalFee(resident.mobility),
            })),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(id: number) {
        this.logger.log('Finding resident', JSON.stringify({ id }));
        const resident = await this.residentsRepository.findOne({
            where: { id: +id },
            relations: ['relatives'],
        });

        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException(`Resident not found`);
        }

        this.logger.log('Resident found', JSON.stringify(resident));
        return {
            ...plainToClass(Resident, resident),
            monthlyFee: this.calculateTotalFee(resident.mobility),
        };
    }

    async update(id: number, updateResidentDto: UpdateResidentDto) {
        this.logger.log(
            'Updating resident',
            JSON.stringify({
                ...updateResidentDto,
            }),
        );
        let relatives = [];

        if (updateResidentDto.relatives) {
            relatives = await this.usersRepository.find({
                where: { id: In(updateResidentDto.relatives) },
            });
        }

        if (updateResidentDto.relatives && relatives.length !== updateResidentDto.relatives.length) {
            this.logger.error('One or more relatives do not exist', JSON.stringify(updateResidentDto.relatives), JSON.stringify(relatives));
            throw new NotFoundException('One or more relatives do not exist');
        }

        relatives.forEach((relative) => {
            if (relative.role !== Role.Relative) {
                this.logger.error('One or more users are not relatives', JSON.stringify(updateResidentDto.relatives), JSON.stringify(relatives));
                throw new NotFoundException('One or more users are not relatives');
            }
        });

        const resident = await this.findOne(id);

        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException(`Resident not found`);
        }

        if (updateResidentDto.bedNumber && resident.bedNumber !== updateResidentDto.bedNumber) {
            await this.checkIfBedIsAvailable(updateResidentDto.bedNumber);
        }

        if (relatives.length > 0) {
            // remove all relatives from the resident  before adding the new ones
            await this.residentsRepository.createQueryBuilder().relation(Resident, 'relatives').of(resident).remove(resident.relatives);
        }

        const newData = {
            ...resident,
            ...updateResidentDto,
            relatives: relatives.length > 0 ? relatives : resident.relatives,
        };

        const updatedResident = await this.residentsRepository.save(newData);
        this.logger.log('Resident updated', JSON.stringify(updateResidentDto));

        return {
            ...plainToClass(Resident, updatedResident),
            monthlyFee: this.calculateTotalFee(updatedResident.mobility),
        };
    }

    async remove(id: number): Promise<void> {
        this.logger.log('Removing resident', JSON.stringify({ id }));
        const resident = await this.getResidentOrFail(id);
        this.logger.log('Resident removed', JSON.stringify({ id }));

        resident.bedNumber = null;
        resident.relatives = [];
        await this.residentsRepository.save(resident);
        await this.residentsRepository.softDelete(id);
    }

    private async getResidentOrFail(id: number): Promise<Resident> {
        const resident = await this.residentsRepository.findOne({ where: { id } });
        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException('Resident not found');
        }
        return resident;
    }

    get numberOfBeds(): number {
        return parseInt(this.configService.get('NUMBER_OF_BEDS'));
    }

    get monthlyFee(): number {
        return parseInt(this.configService.get('MONTHLY_FEE'));
    }

    get extraBedridden(): number {
        return parseInt(this.configService.get('EXTRA_BEDRIDDEN'));
    }

    get extraWheelchair(): number {
        return parseInt(this.configService.get('EXTRA_WHEELCHAIR'));
    }

    get extraCane(): number {
        return parseInt(this.configService.get('EXTRA_CANE'));
    }

    calculateTotalFee(mobility?: Mobility): number {
        switch (mobility) {
            case Mobility.Bedridden:
                return this.monthlyFee + this.extraBedridden;
            case Mobility.Wheelchair:
                return this.monthlyFee + this.extraWheelchair;
            case Mobility.Cane:
                return this.monthlyFee + this.extraCane;
            default:
                return this.monthlyFee;
        }
    }

    async checkIfBedIsAvailable(bedNumber: number) {
        if (bedNumber > this.numberOfBeds) {
            this.logger.error('Bed number is higher than the number of beds', JSON.stringify(bedNumber), this.numberOfBeds);
            throw new BadRequestException('O numero da cama é superior ao número de camas');
        }

        const resident = await this.residentsRepository.findOne({ where: { bedNumber } });
        if (resident) {
            this.logger.error('Bed is already occupied', JSON.stringify({ bedNumber }));
            throw new BadRequestException('A cama já está ocupada');
        }
    }

    async getListOfAvailableBeds(): Promise<{ beds: number[] }> {
        const residents = await this.residentsRepository.find();
        const occupiedBeds = residents.map((resident) => resident.bedNumber);
        const availableBeds = Array.from({ length: this.numberOfBeds }, (_, i) => i + 1).filter((bed) => !occupiedBeds.includes(bed));
        this.logger.log('Available beds', JSON.stringify(availableBeds));
        return {
            beds: availableBeds,
        };
    }

    getBudget(mobility?: Mobility): { budget: number } {
        return {
            budget: this.calculateTotalFee(mobility),
        };
    }

    async addProfilePicture(id: number, file: Express.Multer.File) {
        this.logger.log(`Adding profile picture for resident ${id} with file ${JSON.stringify(file)}`);

        const resident = await this.getResidentOrFail(id);

        if (resident.profilePicture && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'uploads', 'residents', resident.profilePicture))) {
            this.logger.log(`Deleting profile picture ${resident.profilePicture}`);
            fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'uploads', 'residents', resident.profilePicture));
        }

        resident.profilePicture = file.filename;
        await this.residentsRepository.save(resident);
        this.logger.log(`Profile picture added for resident ${id}`);
        return plainToClass(Resident, resident);
    }

    async clearProfilePicture(id: number) {
        const resident = await this.getResidentOrFail(id);

        if (resident.profilePicture && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'uploads', 'residents', resident.profilePicture))) {
            this.logger.log(`Deleting profile picture ${resident.profilePicture}`);
            fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'uploads', 'residents', resident.profilePicture));
        }

        resident.profilePicture = null;
        await this.residentsRepository.save(resident);
    }
}
