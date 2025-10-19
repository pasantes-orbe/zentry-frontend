// src/app/interfaces/recurrents-interface.ts
export interface RecurrentsInterface {
    id:             number;
    status:         boolean;
    guest_name:     string;
    guest_lastname: string;
    dni:            number;
    roleRecurrent:           string;
    access_days:    string;
    property:       Property;
}

export interface Property {
    id:         number;
    name:       string;
    number:     number;
    address:    string;
    avatar:     string;
    id_country: number;
}
