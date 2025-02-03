import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {
 private fetchNotificationsSource = new Subject<void>();

    fetchNotifications$ = this.fetchNotificationsSource.asObservable();
    private refreshTopicsList = new Subject<void>();

    refreshTopicsList$ = this.refreshTopicsList.asObservable();
 
  
  triggerFetchNotifications() {
    this.fetchNotificationsSource.next();
    
  }
  triggerRefreshTopicsList() {
    this.refreshTopicsList.next();
    
  }
}
