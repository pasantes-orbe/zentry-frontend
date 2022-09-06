import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getDate({detail}){
    
    const { value } = detail;

    console.log(value);
    
  }

}
