import { Role } from '../enums/roles.enum';
import { Resident } from '../residents/entities/resident.entity';

export class MessagesEvent {
    id: number;
    content: string;
    resident: Resident;
    user: {
        id: number;
        email: string;
        name: string;
        role: Role;
    };

    constructor(id: number, content: string, resident: Resident, user: { id: number; email: string; name: string; role: Role }) {
        this.id = id;
        this.content = content;
        this.resident = resident;
        this.user = user;
    }
}
