export interface Property_OwnerInterface {
    property: Property;
    owners:   Owner[];
}

export interface Owner {
    id:       number;
    user:     User;
    property: Property;
}

export interface Property {
    id:         number;
    name:       string;
    number:     number;
    address:    string;
    avatar:     string;
    id_country: number;
}

export interface User {
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
