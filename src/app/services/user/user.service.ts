//src/app/services/user/user.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from 'src/app/interfaces/user-interface';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';
import { ToastController } from '@ionic/angular';
import { AuthStorageService } from '../storage/auth-storage.service';
import { from, switchMap, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _htpp :HttpClient,
    private _userStorage: UserStorageService,
    private toastController: ToastController,
    private _auth: AuthStorageService
  ) { }

    getUserByID(id){

      return this._htpp.get<any>(`${environment.URL}/api/users/${id}`)

    }

    updateMyUser(id, name, lastname, birthday, email, phone){
      console.log(birthday, name, lastname, email, phone );


      return this._htpp.patch<UserInterface>(`${environment.URL}/api/users/update-user/${id}`, {
        name,
        birthday,
        lastname, 
        email, 
        phone
      }).subscribe(res => 
        {
          console.log(res);
          this._userStorage.saveUser(res['user'])
        } )
    }

    updateUser(id, name, lastname, birthday, email, phone){
      console.log(birthday, name, lastname, email, phone );


      return this._htpp.patch<UserInterface>(`${environment.URL}/api/users/update-user/${id}`, {
        name,
        birthday,
        lastname, 
        email, 
        phone
      })
    }

    
    async correctlyToast() {
      const toast = await this.toastController.create({
        message: 'Cambios guardados correctamente!',
        duration: 2000,
        position: 'bottom'
      });
  
      await toast.present();
    }
  
    async errorToast() {
      const toast = await this.toastController.create({
        header: 'Ha ocurrido un error al cambiar los horarios!',
        message: 'Por favor intente nuevamente',
        duration: 2000,
        position: 'bottom'
      });
  
      await toast.present();
    }

    // Subir avatar del usuario (multipart/form-data) -> POST /api/users/:id/avatar con campo 'file'
    uploadAvatar(id: number, file: File){
      return from(this.compressImage(file, 1080, 0.7)).pipe(
        switchMap((out: File) => from(this._auth.getJWT()).pipe(
          switchMap(token => {
            const formData = new FormData();
            formData.append('file', out, out.name || (out.type === 'image/png' ? 'avatar.png' : 'avatar.jpg'));
            const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
            return this._htpp.post<any>(`${environment.URL}/api/users/${id}/avatar`, formData, { headers });
          })
        ))
      );
    }

    // Subir avatar como string (dataURL) en JSON
    async uploadAvatarString(id: number, dataUrl: string): Promise<any> {
      const token = await this._auth.getJWT();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return await firstValueFrom(this._htpp.patch<any>(`${environment.URL}/api/users/avatar/${id}`, { avatar: dataUrl }, { headers }));
    }

    // Intento inteligente: primero multipart, si falla, envío base64 como JSON
    async uploadAvatarSmart(id: number, file: File): Promise<any> {
      // Validación básica de tipo
      if (!file || !/^image\//i.test(file.type)) {
        throw new Error('Archivo inválido: se requiere una imagen.');
      }
      // 1) Compresión escalonada para evitar 413 y grandes payloads
      let out: File = file;
      out = await this.compressImage(out, 1080, 0.7);
      if (out.size > 2 * 1024 * 1024) {
        out = await this.compressImage(out, 800, 0.6);
      }
      if (out.size > 2 * 1024 * 1024) {
        out = await this.compressImage(out, 640, 0.5);
      }
      try {
        await firstValueFrom(this.uploadAvatar(id, out));
        return;
      } catch (e) {
        // 2) Fallback: enviar como base64 JSON (usando ya comprimido)
        const dataUrl = await this.fileToDataUrl(out);
        await this.uploadAvatarString(id, dataUrl);
      }
    }

    private fileToDataUrl(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    private async compressImage(file: File, maxSide = 1280, quality = 0.7): Promise<File> {
      try {
        // Intentos escalonados hasta quedar <= 800KB
        const limit = 800 * 1024;
        const targets: Array<{ side: number; q: number }> = [
          { side: 1080, q: 0.7 },
          { side: 800, q: 0.6 },
          { side: 640, q: 0.5 },
          { side: 512, q: 0.5 },
          { side: 480, q: 0.45 }
        ];
        let current: File = file;
        let preferPng = file.type === 'image/png';
        for (const t of targets) {
          const img = await createImageBitmap(current);
          const maxDim = Math.max(img.width, img.height);
          const scale = Math.min(1, t.side / maxDim);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) break;
          ctx.drawImage(img, 0, 0, w, h);

          // 1) Intento en formato original si es PNG (o JPEG si no)
          let blob: Blob = await new Promise((resolve) => canvas.toBlob(
            b => resolve(b as Blob),
            preferPng ? 'image/png' : 'image/jpeg',
            preferPng ? undefined : t.q
          ));
          let name = (file.name || 'avatar') + (preferPng ? '.png' : '.jpg');
          let candidate = new File([blob], name, { type: preferPng ? 'image/png' : 'image/jpeg' });
          if (candidate.size <= limit) { current = candidate; break; }

          // 2) Si PNG sigue grande, probar JPEG como fallback en el mismo tamaño/calidad
          if (preferPng) {
            const blobJ: Blob = await new Promise((resolve) => canvas.toBlob(
              b => resolve(b as Blob), 'image/jpeg', t.q
            ));
            const jpegCandidate = new File([blobJ], (file.name || 'avatar') + '.jpg', { type: 'image/jpeg' });
            // Quedarse con el menor
            current = jpegCandidate.size < candidate.size ? jpegCandidate : candidate;
            // A partir de aquí preferimos JPEG en siguientes iteraciones
            preferPng = false;
            if (current.size <= limit) break;
          } else {
            current = candidate;
          }
        }
        return current;
      } catch {
        return file; // fallback
      }
    }

    deleteUserById(id: number){
      return from(this._auth.getJWT()).pipe(
        switchMap(token => {
          const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
          return this._htpp.delete(`${environment.URL}/api/users/${id}`, { headers });
        })
      );
    }

    // Actualizar estado activo/inactivo (soft-delete / rehabilitar)
    updateUserStatus(id: number, isActive: boolean){
      return from(this._auth.getJWT()).pipe(
        switchMap(token => {
          const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
          return this._htpp.patch<any>(`${environment.URL}/api/users/${id}/status`, { isActive }, { headers });
        })
      );
    }

}
