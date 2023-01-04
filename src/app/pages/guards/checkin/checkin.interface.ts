import { OwnerResponse } from "src/app/interfaces/ownerResponse-interface";

export interface CheckinInterface {
    
    name: string,
    lastname: string,
    DNI: string,
    ownerID: string | number,
    date: string | Date | String,
    transport: string,
    patent: string,
    observations: string
      
}
