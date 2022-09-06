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

  getDate(event){
    
    const { value } = event.detail;

    console.log(value);
    
  }

}
