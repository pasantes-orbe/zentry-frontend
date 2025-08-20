export interface OwnerResponse {
    id: number;
    user: UserInterface; // Usar UserInterface consistentemente
    property: Property;
}

export interface Property {
    id: number;
    name: string;
    number: number;
    address: string;
    avatar: string;
    id_country: number;
}
export interface UserInterface {
    id:       number;
    email:    string;
    name:     string;
    lastname: string;
    password: string;
    phone:    string;
    birthday: Date;
    dni:      number;
    avatar:   string;
    role_id:  number;
}