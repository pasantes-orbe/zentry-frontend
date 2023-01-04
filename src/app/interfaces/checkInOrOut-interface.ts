export interface CheckInOrOut {
    id:                 number;
    guest_name:         string;
    guest_lastname:     string;
    DNI:                string;
    income_date:        Date;
    transport:          null;
    patent:             null;
    details:            null;
    confirmed_by_owner: boolean;
    check_in:           boolean;
    id_guard:           null;
    id_owner:           number;
    user:               User;
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