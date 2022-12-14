export interface PasswordRecoverInterface {
    id:      number;
    changed: boolean;
    date:    Date;
    id_user: number;
    user:    User;
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
