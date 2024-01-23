import { Component } from '@angular/core';
import { NewService } from './services/new.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  data: any;
  constructor(private dataService: NewService, private http: HttpClient, private route: ActivatedRoute, private router:Router) {
    // let url = window.location.href 
    // console.log("url",url);
    // fetch("http://localhost:5200/home")
    // .then((response) => {
    //   console.log(response)
    //   response.json()})
    // .then((json) => console.log(json)); 
  }
  ngOnInit() {
    console.log('url',window.location.href)
    console.log(this.route.snapshot.params);
    // console.log(this.route.snapshot.params.state);
    const apiUrl = window.location.href; // Replace this with your API URL
    // this.route.params.subscribe((params) => {
      // Assuming the parameter in the URL is named 'data'
      // this.data = params['data'];
    // });
    this.dataService.getDataFromUrl(apiUrl).subscribe(
      (response:any) => {
        this.data = response;
        // this.router.navigate(['/about']);
      },
      (error:any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  login(){
    window.location.href = 'https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://localhost:5200/home&acr_values=urn:safelayer:tws:policies:authentication:level:low ';
    
    
    

  //   axios.get('')
  //   .then( (response:any) => {
  //     console.log("response", response.data);
  //     //Do what you want with response after server answered
  // })
  // .catch( (error:any) => {
  //     console.log(error);
  //     //server had a problem 
  // }); 

    // this.dataService.getData().subscribe(
    //   (response:any) => {
    //     this.data = response;
    //     console.log(this.data)
    //     // Here you can access the response from the callback and do further processing.
    //   },
    //   (error) => {
    //     console.error('Error occurred:', error);
    //   },
      
    // );
  }
 
}