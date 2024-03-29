import { Injectable } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { User } from '../shared/models/user';
import { authUser } from '../Auth/store/auth.selector';
import { Store } from '@ngrx/store';
import { rootState } from '../store/rootState';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http:HttpClient,
    private store: Store<rootState>
  ) {}


  addUser(user: User): Observable<any> {

   return this.http.post(`http://localhost:8080/user/adduser`,user);
  }


  getallUsers(): Observable<User[]> {

    return this.http.get<User[]>(`http://localhost:8080/user/users`)
  }


  getUserById(userId:string): Observable<User> {

    return this.http.get<User>(`http://localhost:8080/user/user/${userId}`)
  }

   CurrentAuthUser(): Observable<User | null> {

    return this.store.select(authUser).pipe(
      switchMap((user) => {
        if (!user?.email) {
          return of(null);
        }
        return this.http.get<User>(`http://localhost:8080/user/user/${user.email}`)
      })
    );
  }

    }
