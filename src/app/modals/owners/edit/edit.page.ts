import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  @Input("id_owner") id_owner;


  private readonly: boolean;
  private formBuilder: FormBuilder;
  private form: FormGroup;
  public user;
  public name;
  public lastname;
  public phone;
  public email;
  public birthday;
  
  constructor(protected _formBuilder: FormBuilder, private _userService: UserService, private modalCtrl: ModalController, private toastController: ToastController) { 
    this.formBuilder = _formBuilder;
    this.form = this.createForm();
  }

  async ngOnInit() {


    this._userService.getUserByID(this.id_owner).subscribe(
      res => {
        this.user = res
        this.form.controls['name'].setValue(res.name);
        this.form.controls['lastname'].setValue(res.lastname);
        this.form.controls['phone'].setValue(res.phone);
        this.form.controls['birthday'].setValue(res.birthday);
        this.form.controls['email'].setValue(res.email);
        
      }
    )


    // this.user = user

    // this.form.controls['name'].setValue(user.name);
    // this.form.controls['lastname'].setValue(user.lastname);
    // this.form.controls['phone'].setValue(user.phone);
    // this.form.controls['birthday'].setValue(user.birthday);
    // this.form.controls['email'].setValue(user.email);

    console.log(this.readonly);

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

cancel() {
  return this.modalCtrl.dismiss(null, 'cancel');
}

  updateOwner(){
    // this._userService.updateUser(this.user.id, 
    //                               this.form.get('name').value,
    //                               this.form.get('lastname').value,
    //                               this.form.get('birthday').value,
    //                               this.form.get('email').value,
    //                               this.form.get('phone').value)
                                
    //                             this.form.markAsPristine()
                              
  console.log(this.user.id, 
                                  this.form.get('name').value,
                                  this.form.get('lastname').value,
                                  this.form.get('birthday').value,
                                  this.form.get('email').value,
                                  this.form.get('phone').value)
                                
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
