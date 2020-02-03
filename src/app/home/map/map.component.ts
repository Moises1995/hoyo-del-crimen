import { Component, OnInit } from '@angular/core';
import { PeticionesService } from '../../services/peticiones.service';
import { LocationService } from '../../services/location.service';
import { Crimen } from 'src/app/models/crimen';
import * as moment from 'moment';
import 'moment-duration-format';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [PeticionesService, LocationService]
})

export class MapComponent implements OnInit {
  public longitude: number;
  public latitude: number;
  public distance: number;
  public accuracy: number;
  public zoom: number;
  public crimes: Array<Crimen>;
  public crimesShown: Array<Crimen>;
  public myMarker: any;
  public myCrimes: any;
  public time1: string;
  public time2:string;
  public query:any;
  public options:any;

  constructor(
    private _peticionesService: PeticionesService,
    private _locationService: LocationService
  ){
    // Primero configuramos el texto de nuestros marcadores
    this.myMarker = { color:'white', fontSize:'8px', fontWeight:'bold', text:':v' };
    this.myCrimes = { color:'white', fontSize:'8px', fontWeight:'bold', text:'x_x'};

    this.time1 = "00:00"; this.time2 = "01:00";

    this.query = { start_date:"2019-01", end_date:"2019-12" }
    this.options = { enableHighAccuracy:true, timeout:5000, maximumAge:0 }

    this.crimesShown = [];
    this.distance = 250;
    this.zoom = 17;
  }

  ngOnInit() {
    // Obtenemos nuestra ubicación por 5s
    let pos$ = this._locationService.getCurrenPosition(this.options).subscribe(
      position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.accuracy = position.coords.accuracy;
      },
      error => {
        console.log(`CrimeZone: ${error}`);
        pos$.unsubscribe();
        // Obtenemos un arreglo de crimenes cercanos
        if(error=="Service timeout has been reached"){
          let crim$ = this._peticionesService.getCrimes(this.longitude,this.latitude,this.distance).subscribe(
            result => {
              this.crimes = result;
              this.crimesShown = this.crimes;
              console.log(this.crimes);
            crim$.unsubscribe();
            },
            error => {
              console.log(<any> error);
            }
          );
        }
      }
    );
  }

  // Dibujamos con respecto al tiempo
  nextHour(){
    //obtenemos los minutos y agregamos 60min
    let time1 = moment.duration(this.time1).asMinutes()+60;
    let time2 = moment.duration(this.time2).asMinutes()+60;
    //pasamos nuestros minutos al formato de "horas y minutos"
    this.time1 = moment.duration({m:time1}).format("HH:mm");
    this.time2 = moment.duration({m:time2}).format("HH:mm");

    this.filterCrimes();
  }

  filterCrimes(){
    let crimesAux: Array<Crimen> = [];
    // Convertimos el tiempo 1 y 2 en horas
    let time1 = moment.duration(this.time1).asHours();
    let time2 = moment.duration(this.time2).asHours();
    // Filtramos los crimenes
    for(let i in this.crimes){
      // Obtenemos la hora del crimen
      let crimeHour = moment.duration(this.crimes[i].time).asHours();
      // Comprobamos que la hora del crimen este entre el tiempo 1 y 2
      if(crimeHour>=time1 && crimeHour<=time2){
        crimesAux.push(this.crimes[i]);
      }
    }
    console.log(crimesAux);
    this.crimesShown = crimesAux;
  }
}
