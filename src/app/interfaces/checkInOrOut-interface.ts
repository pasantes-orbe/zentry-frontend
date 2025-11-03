export interface CheckInOrOut {
    id:                 number;
    guest_name:         string;
    guest_lastname:     string;
    DNI:                string;
    income_date:        Date;
    transport:          string | null;
    patent:             string | null;
    details:            string | null;
    confirmed_by_owner: boolean;
    check_in:           boolean;
    id_guard:           number | null;
    id_owner:           number | null;  // ✅ Puede ser null (check-ins sin propietario)
    user:               User | null;    // ✅ Puede ser null cuando no hay propietario
    ownerUser?:         User | null;    // Alias alternativo usado en algunos endpoints
    guardUser?:         User | null;    // Info del guardia cuando está disponible
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