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
    id_owner: number;

    // --- CORRECCIÓN ---
    // Se añaden las propiedades 'guard' y 'owner' como opcionales.
    // El '?' significa que pueden venir o no en la respuesta de la API.
    // Esto soluciona el error y permite que el HTML acceda a 'check.guard.name' de forma segura.
    guard?: BasicUser;
    owner?: BasicUser;
}
