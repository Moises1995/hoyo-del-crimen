import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PlotlyComponent } from './plotly/plotly.component';

// Librerias
import { AgmCoreModule } from '@agm/core';


// Modulos importantes de Http
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlotlyComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule, // Modulos importantes de Http
    HttpClientJsonpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDHIYS8Q_XGg1K99dNSkGK7eljU4oeZexE'
    })// importación de modulos de mapa
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
