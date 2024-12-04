import { Role } from '../enums/roles.enum';
import { Resident } from '../residents/entities/resident.entity';

export class MessagesEvent {
    content: string;
    resident: Resident;
    user: {
        id: number;
        email: string;
        name: string;
        role: Role;
    };

    constructor(content: string, resident: Resident, user: { id: number; email: string; name: string; role: Role }) {
        this.content = content;
        this.resident = resident;
        this.user = user;
    }
}
