//src/app/interfaces/owner-interface.ts
export interface OwnerInterface {
    id:       number;
    email:    string;
    name:     string;
    lastname: string;
    phone:    string;
    birthday: Date;
    dni:      number;
    avatar:   string;
    role:     Role;
}

export interface Role {
    id:     number;
    name:   string;
    avatar: null;
}
