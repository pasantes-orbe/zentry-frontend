import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: true,
})
export class LoaderComponent implements OnInit {

  @Input('loading') loading: boolean;
  @Input('msg') msg: string;

  constructor() { }

  ngOnInit() {}

}
