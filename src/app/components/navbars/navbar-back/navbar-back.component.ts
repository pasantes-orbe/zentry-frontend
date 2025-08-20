import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-navbar-back',
    templateUrl: './navbar-back.component.html',
    styleUrls: ['./navbar-back.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule
    ]
})
export class NavbarBackComponent implements OnInit {

    @Input('title') title: string = '';

    constructor() { }

    ngOnInit() { }

    public getTitle(): string {
        return this.title;
    }

    private setTitle(title: string): void {
        this.title = title;
    }
}