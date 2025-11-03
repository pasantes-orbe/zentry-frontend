// Es una buena práctica definir una interfaz para los objetos anidados.
// Esto le dice a TypeScript cómo es un usuario básico dentro de tu check-in.
interface BasicUser {
    name: string;
    lastname: string;
}

// Esta es la interfaz principal para la respuesta de un Check-In.
export interface CheckInInterfaceResponse {
    id: number;
    guest_name: string;
    guest_lastname: string;
    DNI: string;
    income_date: Date;
    transport: string | null;
    patent: string | null;
    details: string | null;
    confirmed_by_owner: boolean;
    check_in: boolean;
    id_guard: number | null;
    id_owner: number | null;  // ✅ Ahora puede ser null (check-ins sin propietario)

    // --- CORRECCIÓN ---
    // Se añaden las propiedades 'guard' y 'owner' como opcionales.
    // El '?' significa que pueden venir o no en la respuesta de la API.
    // owner puede ser null cuando es un check-in sin propietario (servicios, técnicos, etc.)
    guard?: BasicUser | null;
    owner?: BasicUser | null;  // ✅ Puede ser null para check-ins sin propietario
}
