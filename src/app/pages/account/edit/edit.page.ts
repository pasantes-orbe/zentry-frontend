import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserStorageService } from 'src/app/services/storage/user-storage.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {


  public readonly: boolean;
  private formBuilder: FormBuilder;
  private form: FormGroup;
  public user;
  public name;
  public lastname;
  public phone;
  public email;
  public birthday;
  
  constructor(protected _formBuilder: FormBuilder, protected _userService: UserService, protected _userStorage: UserStorageService) { 
    this.formBuilder = _formBuilder;
    this.form = this.createForm();

  }

  async ngOnInit() {

    const user = await  this._userStorage.getUser()
    

    this.user = user

    this.form.controls['name'].setValue(user.name);
    this.form.controls['lastname'].setValue(user.lastname);
    this.form.controls['phone'].setValue(user.phone);
    this.form.controls['birthday'].setValue(user.birthday);
    this.form.controls['email'].setValue(user.email);

    if(this.user.role.name == 'administrador'){
      this.readonly = false
    } else {
      this.readonly = true
    }

    console.log(this.readonly);

  }
  ionViewWillEnter() {
    this.ngOnInit()
  }

 

  private createForm(): FormGroup{
    return this.formBuilder.group({
      name: [''],
      lastname :[''],
      phone: [''],
      birthday: [''],
      email: ['']
    });
}

  updateUser(){
    this._userService.updateUser(this.user.id, 
                                  this.form.get('name').value,
                                  this.form.get('lastname').value,
                                  this.form.get('birthday').value,
                                  this.form.get('email').value,
                                  this.form.get('phone').value)
                                
                                this.form.markAsPristine()
                              }

  



  getDate(event){
    
    const { value } = event.detail;

    console.log(value);
    
  }

  public getForm(): FormGroup {
    return this.form;
  }


  

}
