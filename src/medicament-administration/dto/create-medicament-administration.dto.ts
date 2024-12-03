import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateMedicamentAdministrationDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^(0|1[0-9]|2[0-3]|([01]?[0-9]))[:][0-5][0-9]$/)
    hour: string;

    @IsNumber()
    dose: number;
}

export class MedicamentAdministrationDTO {
    public hour?: number;
    public minute?: number;
    public dose?: number;

    constructor(administration: IMedicamentAdministrationText) {
        if (!administration) {
            return;
        }

        if (administration.hour) {
            const [hour, minute] = administration.hour.split(':').map(Number);
            this.hour = hour;
            this.minute = minute;
        }
        if (administration.dose) {
            this.dose = administration.dose;
        }
    }
}

export interface IMedicamentAdministrationText {
    hour?: string;
    dose?: number;
}
