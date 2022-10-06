import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loading: boolean;
  private message: string;

  constructor() {
    this.setLoading(false);
  }
  
  private setMessage(msg: string): void{
    this.message = msg;
  }

  public getMessage(): string {
    return this.message;
  }

  public startLoading(msg: string = ''): void {
    this.setLoading(true);
    (msg != '') && this.setMessage(msg);
  }

  public stopLoading(): void {
    this.setMessage('');
    this.setLoading(false);
  }

  public isLoading(): boolean {
    return this.loading;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }



}
