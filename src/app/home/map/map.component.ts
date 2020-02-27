import { Component, OnInit } from '@angular/core';
import { PeticionesService } from '../../services/peticiones.service';
import { LocationService } from '../../services/location.service';
import { Crimen } from 'src/app/models/crimen';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import 'moment-duration-format';
import { IconsMap } from 'src/app/models/iconsMap';
import { CrimesList } from 'src/app/models/crimesList';
import { FormControl } from '@angular/forms';

import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource} from '@angular/material/table';
import { weekDays, yearMounths } from '../../models/dateStruct';
import { listCrimes, classTransport, classPeaton } from '../../models/crimesList';

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
  public time2: string;
  public query:any;
  public options:any;
  public CrimesList:Array<string>;
  public IconsMap:Array<string>;
  public mounthsSelecteds:Array<any>;
  public requestOption:boolean;
  public swap:boolean;
  public daysSelecteds: any;
  public ages:any;
  public agesList:any;
  public months:any;
  public monthsList:any;
  public formLat:any;
  public formLong:any;
  public formCheckDay:any;
  public infoWindowOpened;
  public previous_info_window;
  public numHour: number;
  public listCrimes: Array <any>;

  constructor(
    private _peticionesService: PeticionesService,
    private _locationService: LocationService,
    private _http: HttpClient
  ){
    this.myMarker = { color:'white', fontSize:'8px', fontWeight:'bold', text:':v' };
    this.myCrimes = { color:'white', fontSize:'8px', fontWeight:'bold', text:'x_x'};

    this.time1 = "00:00"; this.time2 = "23:59";
    this.numHour = 1;
    this.query = { start_date:2019, end_date:2019}
    this.options = { enableHighAccuracy:true, timeout:5000, maximumAge:0 }
    this.CrimesList = CrimesList;
    this.IconsMap = IconsMap;

    this.formCheckDay = new FormControl();
    this.daysSelecteds = weekDays;
    this.mounthsSelecteds = yearMounths;

    this.crimesShown = [];
    this.distance = 250;
    this.zoom = 17;

    this.longitude = 0;
    this.latitude = 0;
    this.swap = false;

    this.formLat = new FormControl();
    this.formLong = new FormControl();

    this.ages = new FormControl();
    this.agesList = ['2019', '2018', '2017', '2016', '2015'];
    this.ages.setValue(['2019']);
    this.requestOption = true;

    this.months = new FormControl();
    this.monthsList = yearMounths;
    this.months.setValue(yearMounths);

    this.listCrimes = listCrimes;
  }


  current_location(a){
    this.getRequest();
    this.latitude = a.coords.lat;
    this.longitude = a.coords.lng;

  }
  close_window(){
  if (this.previous_info_window != null ) {
    this.previous_info_window.close()

    }
  }

  select_marker(infoWindow){
    if (this.previous_info_window == null)
    this.previous_info_window = infoWindow;
    else{
      this.infoWindowOpened = infoWindow
      this.previous_info_window.close()
    }
    this.previous_info_window = infoWindow
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
        this.countCrimes();
      }else{
        console.log ("CrimeZone: Location out of range");
      }
    } catch (error) {
      console.log(error);
    }
    this.requestOption = false;
    console.log(this.crimes);
  }

  // Le sumamos a los tiempos 1 hora
  nextHour(){
    console.log("Horas Saltadas: "+this.numHour);
    let time1 = moment(this.time2,'HH:mm');
    let time2 = moment(this.time2,'HH:mm');
    this.time2 = time2.add(60*this.numHour,'minutes').format('HH:mm');
    this.time1 = (time2.minutes()==59)? time1.add(1,'minutes').format("HH:mm"):time1.format("HH:mm");
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
    console.log (`[${this.time1}]-[${this.time2}]`);
    let crimesAux: Array<Crimen> = [];
    // Convertimos el tiempo 1 y 2 en horas
    let time1 = moment.duration(this.time1).asHours();
    let time2 = moment.duration(this.time2).asHours();
    // Filtramos los crimenes
    for(let classification of this.listCrimes){
      if (classification.show)
        for(let crime of this.crimes){
          // Obtenemos la hora del crimen
          let crimeHour = moment.duration(crime.time).asHours();
          // Comprobamos que la hora del crimen este entre el tiempo 1 y 2
          if(crimeHour>=time1 && crimeHour<=time2){
            if (crime.name==classification.name)
              if (this.validateCrimeDate(crime.date))
                crimesAux.push(crime);
          }
        }
    }

    console.log(crimesAux);
    this.crimesShown = crimesAux;
  }


  async getRequest(){
    this.infoWindowOpened = null
    this.previous_info_window = null
    this.requestOption = true;
    try {
      const state = await this._locationService.getState(this.latitude,this.longitude);
      if(state==="Ciudad de México"){
        this.crimes = await this._peticionesService.getCrimes(this.longitude,this.latitude,this.distance, this.query);
        this.crimesShown = this.crimes;
        this.countCrimes ();
        console.log(this.crimes);
      }else{
        console.log ("CrimeZone: Location outside");
      }
      this.requestOption = false;
    } catch (error) {
      console.log(error);
    }
  }

  validateCrimeDate(date:string):boolean{
    //Dias de la semana y meses de año
    let days = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado", "Domingo"];
    let mounth = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    let daysAvailables = [];

    //Obtenemos los dias seleccionados por el usuario
    for (let i in this.daysSelecteds){
      if (this.daysSelecteds[i].value)
        daysAvailables.push(this.daysSelecteds[i].day);
    }

    // Obtenemos el dia y mes del crimen
    let crimeDate = new Date (date);
    let crimeDay = days[crimeDate.getDay()];
    let crimeMounth = mounth[crimeDate.getMonth()];

    // Filtramos por dias y meses seleccionados
    for (let dayNum in daysAvailables){
      if (daysAvailables[dayNum]===crimeDay){
        for (let mounthNum in this.mounthsSelecteds){
          if (this.mounthsSelecteds [mounthNum]==crimeMounth)
            return true;
        }
      }
    }
    return false;
  }

  async validateInputCoordinates(lat, long){
    this.infoWindowOpened = null
    this.previous_info_window = null
    this.requestOption = true;
    try {
      const state = await this._locationService.getState(lat,long);
      console.log(state);
      if(state==="Ciudad de México"){
        this.longitude = long;
        this.latitude = lat;
        this.crimes = await this._peticionesService.getCrimes(this.longitude,this.latitude,this.distance, this.query);
        this.crimesShown = this.crimes;
        this.countCrimes ();
        console.log (this.crimes);
      }else{
        console.log('Ingreso una coordenada no valida');
      }
      this.requestOption = false;
    } catch (error) {
      console.log(error);
    }
  }

  async reset (){
    this.requestOption = true;
    this.months.setValue(yearMounths);
    //Reiniciamos de nuevo los dias
    for (let i in this.daysSelecteds){
      if (!this.daysSelecteds[i].value)
      this.daysSelecteds[i].value = true;
    }

    this.query = { start_date:2019, end_date:2019};
    this.time1 = "00:00"; this.time2 = "23:59";
    this.swap = false;
    this.numHour = 1;
    try {
      const position = await this._locationService.getPosition(this.options);
      this.latitude = position.lat;
      this.longitude = position.long;
      this.accuracy = position.accy;
      await this.getRequest ();
    } catch (error) {
      console.log(error);
    }
    this.requestOption = false;
    console.log(this.crimes);
  }

  classificationOption(option: number){
    if (option==1){
      for (let classification of this.listCrimes){
        classification.show = true;
      }
    }else {
      let values = (option==2) ? classTransport : classPeaton;
      for (let classification of this.listCrimes){
        for (let value of values){
            classification.show = (value==classification.name) ? true : false;
        }
      }
    }
    this.filterCrimes();
  }

  countCrimes(){
    for(let crime of this.listCrimes){
      crime.num = 0;
    }

    for (let classification of this.listCrimes){
      for (let crime of this.crimes){
        if (crime.name==classification.name)
          classification.num++;
      }
    }
  }
}
