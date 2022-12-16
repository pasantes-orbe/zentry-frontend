export interface Owner_CountryInterface {
    id:         number;
    id_user:    number;
    id_country: number;
    user:       User;
    country:    Country;
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
}
