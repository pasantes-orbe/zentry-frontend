import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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
    @Input('defaultHref') defaultHref: string = '/admin/home';

    constructor(
        private location: Location,
        private router: Router
    ) { }

    ngOnInit() { }

    public goBack(): void {
        // Intentar volver atrás en el historial
        if (window.history.length > 1) {
            this.location.back();
        } else {
            // Si no hay historial, ir al defaultHref
            this.router.navigate([this.defaultHref]);
        }
    }

    public getTitle(): string {
        return this.title;
    }

    private setTitle(title: string): void {
        this.title = title;
    }
}