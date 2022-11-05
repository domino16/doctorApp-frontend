import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { AuthService } from '../Auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userSub!:Subscription;
  loggedIn:boolean = false;

  constructor(private authService: AuthService, private appComponent:AppComponent){}


  ngOnInit(): void {
    this.loggedIn = this.appComponent.loggedIn
  }

  onLogout(){
    this.authService.logout()
  }


}
