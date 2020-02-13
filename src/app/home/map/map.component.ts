import { Component, OnInit } from '@angular/core';
import { PeticionesService } from '../../services/peticiones.service';
import { LocationService } from '../../services/location.service';
import { Crimen } from 'src/app/models/crimen';
import { DaySelected } from '../../models/daySelected';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import 'moment-duration-format';
import { MounthSelected } from '../../models/mounthSelected';
import { IconsMap } from 'src/app/models/iconsMap';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [PeticionesService, LocationService]
})

export class MapComponent implements OnInit {
  private urlNominatim:string;
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
  public daysSelecteds:Array<DaySelected>;
  public mounthsSelecteds:Array<MounthSelected>;
  public iconsMap:IconsMap;

  constructor(
    private _peticionesService: PeticionesService,
    private _locationService: LocationService,
    private _http: HttpClient
  ){
    // Primero configuramos el texto de nuestros marcadores
    this.urlNominatim = "https://nominatim.openstreetmap.org/reverse?format=jsonv2";
    this.myMarker = { color:'white', fontSize:'8px', fontWeight:'bold', text:':v' };
    this.myCrimes = { color:'white', fontSize:'8px', fontWeight:'bold', text:'x_x'};

    this.time1 = "00:00"; this.time2 = "01:00";
    this.query = { start_date:2019, end_date:2019}
    this.options = { enableHighAccuracy:true, timeout:5000, maximumAge:0 }

    this.iconsMap ={
      subway_d:  "http://localhost:4200/assets/img/subway_d.svg",
      subway: "http://localhost:4200/assets/img/subway.svg",
      bus_d: "http://localhost:4200/assets/img/bus_d.svg",
      bus: "http://localhost:4200/assets/img/bus.svg",
      taxi: "http://localhost:4200/assets/img/taxi.svg",
      house: "http://localhost:4200/assets/img/house.svg",
      account: "http://localhost:4200/assets/img/account.svg",
      store: "http://localhost:4200/assets/img/store.svg",
      deliver: "http://localhost:4200/assets/img/deliver.svg",
      deliver_d: "http://localhost:4200/assets/img/deliver_d.svg",
      crime: "http://localhost:4200/assets/img/gun.svg",
      crime_d: "http://localhost:4200/assets/img/crime_d.svg",
      vehicle: "http://localhost:4200/assets/img/vehicle.svg",
      vehicle_d: "http://localhost:4200/assets/img/vehicle_d.svg",
      kidnapping: "http://localhost:4200/assets/img/kidnapping.svg",
      rape: "http://localhost:4200/assets/img/rape.svg",
    } 
    this.daysSelecteds = [
      new DaySelected("Lunes", true),
      new DaySelected("Martes", true),
      new DaySelected("Miercoles", true),
      new DaySelected("Jueves", true),
      new DaySelected("Viernes", true),
      new DaySelected("Sabado", true),
      new DaySelected("Domingo", true)
    ];

    this.mounthsSelecteds = [
      new MounthSelected("Enero", true),
      new MounthSelected("Febrero", true),
      new MounthSelected("Marzo", true),
      new MounthSelected("Abril", true),
      new MounthSelected("Mayo", true),
      new MounthSelected("Junio", true),
      new MounthSelected("Julio", true),
      new MounthSelected("Agosto", true),
      new MounthSelected("Septiembre", true),
      new MounthSelected("Octubre", true),
      new MounthSelected("Noviembre", true),
      new MounthSelected("Diciembre", true)
    ];

    this.crimesShown = [];
    this.distance = 250;
    this.zoom = 17;
  }

  async ngOnInit(){
    try {
      const position = await this._locationService.getPosition(this.options);
      this.latitude = position.lat;
      this.longitude = position.long;
      this.accuracy = position.accy;
      const state = await this._locationService.getState(this.latitude,this.longitude);
      console.log(state);
      if(state==="Ciudad de México"){
        this.crimes = await this._peticionesService.getCrimes(this.longitude,this.latitude,this.distance);
        this.crimesShown = this.crimes;
      }else{
        console.log ("CrimeZone: Location out of range");
      }
    } catch (error) {
      console.log(error);
    }
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

  previousHour(){
    //obtenemos los minutos y le quitamos 60min
    let time1 = moment.duration(this.time1).asMinutes()-60;
    let time2 = moment.duration(this.time2).asMinutes()-60;
    //pasamos nuestros minutos al formato de "horas y minutos"
    if (time1 != 0)
      this.time1 = moment.duration({m:time1}).format("HH:mm");
    else
      this.time1 = "00:00";
    this.time2 = moment.duration({m:time2}).format("HH:mm");

    this.filterCrimes();
  }

  nextYear (){
    this.query.start_date++;
    this.query.end_date++;
  }

  previousYear (){
    this.query.start_date--;
    this.query.end_date--;
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
        if (this.validateCrimeDate(this.crimes[i].date))
          crimesAux.push(this.crimes[i]);
      }
    }
    console.log(crimesAux);
    this.crimesShown = crimesAux;
  }


  async getRequest (){
    try {
      const state = await this._locationService.getState(this.latitude,this.longitude);
      if(state==="Ciudad de México"){
        this.crimes = await this._peticionesService.getCrimes(this.longitude,this.latitude,this.distance, this.query);
        this.crimesShown = this.crimes;
        console.log (this.crimes);
      }else{
        console.log ("CrimeZone: Location outside");
      }
    } catch (error) {
      console.log(error);
    }
  }

  validateCrimeDate(date:string):boolean{
    //Dias de la semana y meses de año
    let days = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado", "Domingo"];
    let mounth = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    let daysAvailables = [];
    let mounthsAvaibles = [];

    //Obtenemos los dias seleccionados por el usuario
    for (let i in this.daysSelecteds){
      if (this.daysSelecteds[i].value)
        daysAvailables.push(this.daysSelecteds[i].day);
    }

    //Obtenemos los meses selccionado por el usuario
    for (let j in this.mounthsSelecteds){
      if (this.mounthsSelecteds[j].value)
        mounthsAvaibles.push(this.mounthsSelecteds[j].mounth);
    }

    // Obtenemos el dia y mes del crimen
    let crimeDate = new Date (date);
    let crimeDay = days[crimeDate.getDay()];
    let crimeMounth = mounth[crimeDate.getMonth()];

    // Filtramos por dias y meses seleccionados
    for (let dayNum in daysAvailables){
      if (daysAvailables[dayNum]===crimeDay){
        for (let mounthNum in mounthsAvaibles){
          if (mounthsAvaibles[mounthNum]==crimeMounth)
            return true;
        }
      }
    }
    return false;
  }
}