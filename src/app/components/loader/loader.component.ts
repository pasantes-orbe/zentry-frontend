import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Se importan los componentes de Ionic necesarios
import { IonText, IonSpinner } from '@ionic/angular/standalone';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: true,
    // Se agregan las importaciones que faltaban
    imports: [
        CommonModule,
        IonText,
        IonSpinner
    ]
})
export class LoaderComponent implements OnInit {

    @Input('loading') loading: boolean;
    @Input('msg') msg: string;

    constructor() { }

    ngOnInit() { }

}
// Este componente LoaderComponent se utiliza para mostrar un spinner de carga y un mensaje opcional mientras se cargan datos o se realizan operaciones asíncronas.