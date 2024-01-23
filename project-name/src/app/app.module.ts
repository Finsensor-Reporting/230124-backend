import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { PdfViewerModule } from 'ng2-pdf-viewer';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,HttpClientModule,AppRoutingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
