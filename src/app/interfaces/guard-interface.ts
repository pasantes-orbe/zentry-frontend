export interface GuardInterface {
    guard:   Guard;
    working: boolean;
}

export interface Guard {
    id:       number;
    week_day: string;
    start:    Date;
    exit:     Date;
    user:     User;
    country:  Country;
}

export interface Country {
    id:        number;
    name:      string;
    latitude:  number;
    longitude: number;
    avatar:    string;
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
    avatar:   null;
    role_id:  number;
    role:     Role;
}

export interface Role {
    id:     number;
    name:   string;
    avatar: null;
}
