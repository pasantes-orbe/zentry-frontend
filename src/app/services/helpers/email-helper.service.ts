import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailHelperService {

  private EMAIL_PATTERN;

  constructor() {
    this.setEmailPattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  }

  public getEmailPattern(): RegExp {
    return this.EMAIL_PATTERN;
  }

  private setEmailPattern(EMAIL_PATTERN: RegExp): void {
    this.EMAIL_PATTERN = EMAIL_PATTERN;
  }

}
