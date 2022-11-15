import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Message } from '../shared/models/message';
import {
  Observable,
  combineLatest,
  map,
  from,
  switchMap,
  tap,
  of,
  startWith,
} from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../shared/models/user';
import { AuthService } from '../Auth/auth.service';
import { ChatService } from '../services/chat.service';
import { FormControl } from '@angular/forms';
import { Chat } from '../shared/models/chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild('chatEnd')
  chatEnd!: ElementRef;

  username: string = '';
  messages!: Observable<Message[]>;
  searchControl = new FormControl<string | User>('');
  users!: User[];
  currentUser!: User | null;
  hideClassToggle: boolean = false;
  myChats: Observable<Chat[]> = this.chatService.myChats;
  chatDisplayName: string | undefined = '';
  chatListControl = new FormControl<string[] | string | null>('');
  messageControl = new FormControl('');
  chatAllMessages: Message[] = [];
  currentDate = new Date().getTime();
  filteredUsers!: Observable<User[]>;
  selectedChat = combineLatest([
    this.chatListControl.valueChanges,
    this.myChats,
  ]).pipe(map(([value, chats]) => chats.find((c) => c.id === value![0])));
  otherUserIndex!: number;
  myUserIndex!: number;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.userService.getallUsers().subscribe((user) => {
      this.users = user;
      this.filteredUsers = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.displayName;
          return name ? this._filter(name as string) : this.users?.slice();
        })
      );
    });

    this.selectedChat.subscribe((chat) => {
      this.otherUserIndex =
        chat?.userIDs.indexOf(this.currentUser?.email ?? '') === 0 ? 1 : 0;
      this.myUserIndex =
        chat?.userIDs.indexOf(this.currentUser?.email ?? '') === 0 ? 0 : 1;
    });

    this.userService.CurrentAuthUSer.subscribe(
      (user) => (this.currentUser = user)
    );

    this.chatListControl.valueChanges
      .pipe(
        tap((value) => (this.chatAllMessages = [])),
        map((value) => value![0]),
        switchMap((chatID) => this.chatService.getChatMessages(chatID)),
        tap(() => {
          this.scrollToBottom();
        })
      )
      .subscribe((messsage) => {
        this.chatAllMessages = messsage;
      });
  }

  displayFn(user: User): string {
    return user && user.displayName ? user.displayName : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.users.filter((option) =>
      option.displayName?.toLowerCase().includes(filterValue)
    );
  }

  createChat(user: User) {
    this.chatService
      .chatExist(user.uid)
      .pipe(
        switchMap((chatId) => {
          if (chatId) {
            this.searchControl.setValue('');
            return of(chatId);
          } else {
            return this.chatService.createChat(user);
          }
        })
      )
      .subscribe((chatId) => {
        this.chatListControl.setValue([chatId]);
      });
  }

  onSubmit() {
    const message = this.messageControl.value;
    const selectedChatID: any = this.chatListControl.value;

    if (message && selectedChatID[0]) {
      this.chatService.addChatMessage(selectedChatID[0], message).subscribe();
      this.messageControl.setValue('');
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatEnd) {
        this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 10);
  }

  onClickX() {
    this.chatListControl.setValue('');
    this.chatAllMessages = [];
    this.chatListControl.valueChanges
      .pipe(
        map((value) => value![0]),
        switchMap((chatID) => this.chatService.getChatMessages(chatID)),
        tap(() => {
          this.scrollToBottom();
        })
      )
      .subscribe((messsage) => (this.chatAllMessages = messsage));

    this.hideClassToggle = !this.hideClassToggle;
  }
}
