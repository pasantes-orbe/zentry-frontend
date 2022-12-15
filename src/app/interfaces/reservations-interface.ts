export interface ReservationsInterface {
    id:         number;
    date:       Date;
    details:    string;
    status:     string;
    id_user:    number;
    id_amenity: number;
    user:       User;
    amenity:    Amenity;
}

export interface Amenity {
    id:         number;
    name:       string;
    image:      string;
    address:    string;
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
    avatar:   null;
    role_id:  number;
}
