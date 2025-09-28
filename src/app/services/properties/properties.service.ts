//src/app/services/properties/properties.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AlertService } from '../helpers/alert.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { CountryStorageService } from '../storage/country-storage.service';
import { PropertyInterface } from '../../interfaces/property-interface';
import { Observable } from 'rxjs';
import { Property_OwnerInterface } from '../../interfaces/property_owner-interface';


@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  constructor(
    private _http: HttpClient, 
    private _alertService: AlertService,
    private _router: Router, 
    private _authStorageService: AuthStorageService, 
    private _countryStorageService: CountryStorageService
  ){ }
  
    public async addProperty(formData: FormData): Promise<any> {

  //public async addCountry(avatar: File, name: string, address: string, propertyNumber: any){
    const token = await this._authStorageService.getJWT();
    const country = await this._countryStorageService.getCountry(); 

    //prueba temporal hasta que este la interfaz de seleccion de countries. 
    //let country = await this._countryStorageService.getCountry();
    //if (!country || !country.id) {
    //  console.warn("ADVERTENCIA: No hay un 'country' seleccionado. Usando ID de prueba (1) para las pruebas.");
      // Simula un 'country' de prueba con un ID que sabes que existe en tu DB
    //  country = { id: 4, name: 'Laguna Arguello', latitude: -27.453830998597063, longitude: -58.97186279296876, image: '' }; // ✅ Puedes cambiar el ID según tu DB
    //}

    const countryID = country.id;
    //const formData = new FormData();
    //formData.append('avatar', avatar);
    //formData.append('name', name);
    //formData.append('address', address);
    //formData.append('number', propertyNumber);
    formData.append('id_country', countryID.toString());

    const httpOptions = {
      headers: new HttpHeaders({
        // 🚨 CORRECCIÓN CLAVE: Envía el token con el prefijo Bearer para la autenticación en el backend.
        'Authorization': `Bearer ${token}`, 
      }),
    };

    //await this._alertService.setLoading();
    // 🚨 CORRECCIÓN CRÍTICA: Se ELIMINA el 'return' de aquí para poder usar el método '.subscribe()' abajo.
    // El 'return' hacía que la promesa no se manejara correctamente y causaba la redirección al login.
    this._http.post(`${environment.URL}/api/properties`, formData, httpOptions)
     .subscribe(async (res) => { // ⬅️ Este es el callback de ÉXITO (resuelve la redirección)
       console.log(res);
       await this._alertService.removeLoading();
       this._alertService.showAlert("¡Listo!", "La propiedad se agregó con éxito");
       this._router.navigate([`/admin/ver-propiedades`]);
  }
, // ⬅️ Coma para separar los callbacks de éxito y error
  async (err) => { // ⬅️ Este es el callback de ERROR
    console.log(err);
    await this._alertService.removeLoading();
    if(err['status'] == 0){
      await this._alertService.showAlert("Por favor subí una foto desde tu galería o archivos!", ``);
    } else {
      // ⚠️ Nota: Esta línea te redirige a pesar del error. Si quieres quedarte en el formulario, coméntala.
      await this._router.navigate([`/admin/ver-propiedades`]); 
      await this._alertService.showAlert("¡Ooops!", `${err['error']}`);
  }
    }
  
  

  ); // ⬅️ El paréntesis finaliza la llamada al .subscribe()

};
// ... El resto del código permanece igual con la corrección de 'Bearer ' aplicada ...
public async getAll(): Promise<Observable<PropertyInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const httpOptions = {
    headers: new HttpHeaders({
      // 🚨 CORRECCIÓN: Aplicada a todas las llamadas que necesitan autenticación.
      'Authorization': `Bearer ${token}`,
    }),
  };
  return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties`, httpOptions);

}


public async getBySearchTerm(searchTerm) : Promise<Observable<PropertyInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const country = await this._countryStorageService.getCountry()
  const countryID = country.id;

  const httpOptions = {
    headers: new HttpHeaders({
      // 🚨 CORRECCIÓN: Aplicada.
      'Authorization': `Bearer ${token}`,
    }),
  };
  return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties/${countryID}/${searchTerm}`, httpOptions);
}

    // 🟢 NUEVO MÉTODO: Obtiene las propiedades del usuario logueado
    public async getOwnerProperties(): Promise<Observable<PropertyInterface[]>> {
        const token = await this._authStorageService.getJWT();
        
        // El Interceptor que implementamos DEBERÍA manejar esto, pero si no se usa:
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`, // Se incluye por si acaso el Interceptor falla o no se usa
            }),
        };

        // Llama a la nueva ruta protegida /api/properties/owner-properties
        return this._http.get<PropertyInterface[]>(`${environment.URL}/api/properties/owner-properties`, httpOptions);
    }


public async getAllProperty_OwnerByCountryID():Promise<Observable<Property_OwnerInterface[]>> {
  const token = await this._authStorageService.getJWT();
  const country = await this._countryStorageService.getCountry()
  const countryID = country.id
  const httpOptions = {
    headers: new HttpHeaders({
      // 🚨 CORRECCIÓN: Aplicada.
      'Authorization': `Bearer ${token}`,
    }),
  };
  return this._http.get<Property_OwnerInterface[]>(`${environment.URL}/api/properties/country/get_by_id/${countryID}`, httpOptions);
}


async getOneProperty(id: number){

  const token = await this._authStorageService.getJWT()

  const httpOptions = {
    headers: new HttpHeaders({
      // 🚨 CORRECCIÓN: Aplicada.
      'Authorization': `Bearer ${token}`,
    }),
  };

  return this._http.get(`${environment.URL}/api/properties/${id}`, httpOptions)

  }


   editProperty(token, id, name, number, address){
    // Nota: Esta función recibe el token como parámetro, a diferencia de las async que lo obtienen de storage.
    // Esto es un patrón menos común, pero funciona siempre que el componente pase el token correcto.

    const httpOptions = {
      headers: new HttpHeaders({
        // 🚨 CORRECCIÓN: Aplicada al token pasado como parámetro.
        'Authorization': `Bearer ${token}`,
      }),
    };

   return this._http.patch(`${environment.URL}/api/properties/${id}`, {
      name,
      number,
      address
    }, httpOptions)

  }

  deleteProperty(id, token){
    // Nota: Esta función recibe el token como parámetro, igual que editProperty.

    const httpOptions = {
      headers: new HttpHeaders({
        // 🚨 CORRECCIÓN: Aplicada al token pasado como parámetro.
        'Authorization': `Bearer ${token}`,
      }),
    };
   return this._http.delete(`${environment.URL}/api/properties/${id}`, httpOptions)

  }


}