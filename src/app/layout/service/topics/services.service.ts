import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  constructor(private http:HttpClient) { }

gettopiclist(){
  return this.http.get('http://localhost:3000/data')
}

addtopic(obj:any):Observable<any>{
  return this.http.post('http://localhost:3000/data',obj)
}
}
