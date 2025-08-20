import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

// Importar el pipe personalizado
import { FilterByPipe } from 'src/app/pipes/filter-by.pipe';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.component.html',
    styleUrls: ['./invitations.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FilterByPipe // Agregar el pipe aquí
    ]
})
export class InvitationsComponent implements OnInit {

    @Input() guests: any[] = [];

    public searchKey: string = '';

    constructor(public modal: ModalController) { }

    ngOnInit() {
        console.log(this.guests);
    }
}