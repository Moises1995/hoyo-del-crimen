import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { AgmCoreModule } from '@agm/core';

import { DisableControlDirective } from '../directives/disablecontroldirective';
import { MaterialModule } from './material.module';
import { Ng5SliderModule } from 'ng5-slider';

@NgModule({
  declarations: [MapComponent, DisableControlDirective],
  exports: [MapComponent, AgmCoreModule],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    Ng5SliderModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDHIYS8Q_XGg1K99dNSkGK7eljU4oeZexE'
    })// importación de modulos de mapa
  ]
})
export class HomeModule { }
