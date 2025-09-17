// src/app/interfaces/notification-interface.ts
import { ReservationsInterface } from "./reservations-interface";

export interface NotificationInterface {
    id?: number;
    title: string;
    content: string;
    read?: boolean;
    id_user: number;
    reservation_id?: number;
    reservation?: ReservationsInterface;
    createdAt?: Date;
    updatedAt?: Date;
}