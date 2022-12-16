export interface GuardResponseInterface {
    msg: string
    user: userInfo
}

export interface userInfo{
    id: number;
    name: string;
    lastname: string;
    password: string;
    email: string;
    phone: string;
    birthday: Date;
    DNI: number;
    avatar: string;
    role_id: number;
}
