export interface RecurrentsInterface {
    id:             number;
    status:         boolean;
    guest_name:     string;
    guest_lastname: string;
    dni:            number;
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
