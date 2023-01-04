export interface CheckInInterfaceResponse {
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
}
