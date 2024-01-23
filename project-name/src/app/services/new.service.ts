import { Injectable } from '@angular/core';
// import { Http, Headers, ResponseContentType } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'
// import { GenericService } from 'app/guard/generic.service';
// import { AppConfig } from '../app.config';

@Injectable({
    providedIn: 'root'
  })
export class NewService{

    constructor(private http: HttpClient) {}

    getDataFromUrl(url: string): Observable<any> {
      // var params = {
      //   url: url
      // }
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      };
      return this.http.post('http://localhost:6019/api/authorize',{url:url});
    }
}