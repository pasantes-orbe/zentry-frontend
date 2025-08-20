export interface UserInterface {
    id: number;
    email: string;
    name: string;
    lastname: string;
    password: string;
    phone: string;
    birthday: Date;
    dni: number;
    avatar: string | null;
    role_id: number;
}
export interface User {
    id: number;
    email: string;
    name: string;
    lastname: string;
    password: string;
    phone: string;
    birthday: Date;
    dni: number;
    avatar: string | null;
    role_id: number;
}