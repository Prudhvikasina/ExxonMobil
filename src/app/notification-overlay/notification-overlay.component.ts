import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TopicserviceService } from '../dashboard/services/topicservice.service';

@Component({
  selector: 'app-notification-overlay',
  templateUrl: './notification-overlay.component.html',
  styleUrls: ['./notification-overlay.component.scss']
})
export class NotificationOverlayComponent {
  @ViewChild('opBell') overlayPanel!: OverlayPanel;
  @Input() notify: any[] = [];  // Notifications array
  @Input() UserId: number = 0;  // UserId
  
  @Input() notifyme: any[] = [];

  @Output() totalNotificationCount = new EventEmitter<number>();
  @Output() callParentFunction = new EventEmitter<{ requestIds: number, pageSize: number, pageNumber: number, sortBy: string, sortOrder: string, userId: number, searchValue: string}>();
  
  constructor(private topicservice: TopicserviceService) {}
  ngOnInit():void {
 
  }
  // Method to toggle the overlay panel
  toggle(event: Event) {
    if (this.overlayPanel) {
      this.overlayPanel.toggle(event);
    }
  }
  
  ngOnChanges() {
    this.emitTotalNotificationCount();
  }
  emitTotalNotificationCount() {
    const totalCount = this.getTotalNotifications();
    this.totalNotificationCount.emit(totalCount);
  }

  async notifyread() {
    // Update the status of notifications to mark them as read
    this.notify.forEach(notification => {
      notification.read = true; // Assuming there's a 'read' property to mark as read
    });
  
    // Call the API to mark them as read
    await this.topicservice.notifyseen(this.UserId);
  
    // Emit the updated total count of notifications (set to 0)
    this.totalNotificationCount.emit(0);
  }
  

  getTotalNotifications(): number {
    // return (this.notify?.length || 0) + (this.notifyme?.length || 0);
    let filter = this.notify.filter((notification:any) => { if(notification.IsSeen != 1){
      return notification
    }})
    return (filter?.length || 0);
  }
  // Accept the notification
  async accept(notification: any) {
    // Your accept logic here (e.g., change 'Sent' status, call API, etc.)
    notification.Sent = 'Accepted';
    notification.IsAccepted = 1;
    notification.IsSeen = 1;
    this.emitTotalNotificationCount();
    const payload1 = {
      TopicNotificationId: notification.TopicNotificationId,
      topic_id: notification.TopicId,
      is_accepted: true,
      user_id: this.UserId
    };
    
    try {
      const response1 = await this.topicservice.updateNotifications(payload1);
      console.log(response1);
      console.log(`${notification.FirstName} ${notification.LastName} accepted the invitation.`);

      const requestIds=6
      const pageSize = 100
      const pageNumber = 1
      const sortBy = 'Createdon'
      const sortOrder = 'Desc'
      const userId =  this.UserId
      const searchValue = ""
                  // Example parameter
        this.callParentFunction.emit({ requestIds, pageSize, pageNumber, sortBy, sortOrder, userId, searchValue });
      
      
      
      // Remove the accepted notification from the list
      // this.notify = this.notify.filter(notif => notif.TopicNotificationId !== notification.TopicNotificationId);
    } catch (error) {
      console.error('Error accepting notification', error);
    }
  }

  // Decline the notification
  async decline(notification: any) {
    // Your decline logic here (e.g., change 'Sent' status, call API, etc.)
    notification.Sent = 'Declined';
    notification.IsAccepted = 0;
    notification.IsSeen = 1;
    const payload1 = {
      TopicNotificationId: notification.TopicNotificationId,
      topic_id: notification.TopicId,
      is_accepted: false,
      user_id: this.UserId
    };
    this.emitTotalNotificationCount();

    try {
      const response1 = await this.topicservice.updateNotifications(payload1);
      console.log(response1);
      console.log(`${notification.FirstName} ${notification.LastName} declined the invitation.`);

      // Remove the declined notification from the list
      // this.notify = this.notify.filter(notif => notif.TopicNotificationId !== notification.TopicNotificationId);
    } catch (error) {
      console.error('Error declining notification', error);
    }
  }
}
