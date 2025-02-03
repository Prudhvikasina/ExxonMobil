import { Component, ElementRef, ViewChild } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';

import { RouterLinkActive } from '@angular/router';
import { TopicserviceService } from '../dashboard/services/topicservice.service';

import { MsalService } from '@azure/msal-angular';
import { MsalAuthenticationService } from "../msal-authentication.service";
import { AppLayoutComponent } from './app.layout.component';
import { Router, NavigationEnd } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { NotificationServiceService } from '../dashboard/services/notification-service.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { trigger } from '@angular/animations';

interface Notification {
  AliasName: string;
  FirstName: string;
  LastName: string;
  Sent: string; // Assuming Sent is of type string
  notificationText: string;
  isVisible: boolean; // Added isVisible property
}
@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {

  @ViewChild('menuButton') menuButton!: ElementRef;

  @ViewChild('mobileMenuButton') mobileMenuButton!: ElementRef;

  @ViewChild('searchInput') searchInput!: ElementRef;
  notificationList: any
  userId: any;
  topicIdnew: any;

  constructor(public el: ElementRef, private router: Router, private sharedService: NotificationServiceService, public layoutService: LayoutService, private authService: MsalService, private msal: MsalAuthenticationService, public app: AppLayoutComponent,
    private topicservice: TopicserviceService, private toastService: HotToastService) { }

  activeItem!: number;
  customwidth: boolean = false;
  sidebarVisible: boolean = true;

  model: MegaMenuItem[] = [
    {
      label: 'UI KIT',
      items: [
        [
          {
            label: 'UI KIT 1',
            items: [
              { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
              { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
              { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
              { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'] },
              { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] }
            ]
          }
        ],
        [
          {
            label: 'UI KIT 2',
            items: [
              { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
              { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
              { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
              { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
              { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] }
            ]
          }
        ],
        [
          {
            label: 'UI KIT 3',
            items: [
              { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
              { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
              { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
              { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
              { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc'] }
            ]
          }
        ]
      ]
    },
    {
      label: 'UTILITIES',
      items: [
        [
          {
            label: 'UTILITIES 1',
            items: [
              { label: 'Icons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons'] },
              { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://www.primefaces.org/primeflex/', target: '_blank' }
            ]
          }
        ],

      ]
    }
  ];


  sidebarslidingVisible() {


    if (this.sidebarVisible === false) {
      this.customwidth = true;
      // this.isExpandednew =true;
    } else {
      this.customwidth = false
    }
  }

  get mobileTopbarActive(): boolean {
    return this.layoutService.state.topbarMenuActive;
  }

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

  onRightMenuButtonClick() {
    this.layoutService.openRightSidebar();
  }

  onMobileTopbarMenuButtonClick() {
    this.layoutService.onTopbarMenuToggle();
  }

  focusSearchInput() {
    setTimeout(() => {
      this.searchInput.nativeElement.focus()
    }, 0);
  }
  logout() {
    this.authService.logout();
    localStorage.clear()
  }




  get AliasName(): string {
    if (this.authService.instance.getActiveAccount() !== null) {
      const activeAccount = this.authService.instance.getActiveAccount();
      if (activeAccount !== null) {
        console.log(activeAccount);
        
        const email = activeAccount.username;
        const parts = email.split('@');
        if (parts.length > 0) {
          return parts[0];
        }
      }
    }
    return '';
  }

  notifications: any[] = [];
  notificationsSharedToMe: any[] = [];
  notificationsSharedByMe: any[] = [];
  acceptSuccess = false;
  acceptError = false;
  declineSuccess = false;
  declineError = false;
  notificationTotalCount: number = 0;
  notificationSharedTotalCount: number = 0;
  userIdGet: any;
  private subscription: Subscription | undefined;

  ngOnInit(): void {
    // this.fetchUserId();
    this.subscription = this.sharedService.fetchNotifications$.subscribe(() => {
      this.fetchNotifications();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

//   private async fetchUserId(): Promise<void> {
//     const name = this.AliasName.split('.')[0];
//     try {
//         const res = await this.topicservice.searchUsers(name);
//         res.subscribe((data: any) => {

//           console.log(data)

//           this.userId = data[0].UserId;
        
            
//         }) 
//         await this.fetchNotifications();
//         await this.fetchNotificationsSharedToMe();
        
//     } catch (error) {
//         console.error('Error fetching user ID:', error);
//     }
// }

// Fetch Notifications
private async fetchNotifications(): Promise<void> {
    if (!this.userId) return;
    try {
        const response: any = await this.topicservice.getAllNotifications(this.userId, 1, 100, 1, 'FirstName', 'ASC');
        this.notificationsSharedByMe = response;
        this.notifications = response.map((notification: any) => ({ ...notification, isVisible: true }));
        
        this.notificationTotalCount = response.length === 0 ? 0 : response[0]["TotalCount"];
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

// Toggle Visibility
toggleVisibility(index: number): void {
    this.notifications[index].isVisible = !this.notifications[index].isVisible;
}

// Fetch Notifications Shared to Me
private async fetchNotificationsSharedToMe(): Promise<void> {
    if (!this.userId) return;
    try {
        const response: any = await this.topicservice.getAllNotificationsSharedToMe(this.userId, 1, 100, 1, 'FirstName', 'ASC');
        this.notificationsSharedToMe = response;
        
        this.notificationSharedTotalCount = response.length === 0 ? 0 : response[0]["TotalCount"];
    } catch (error) {
        console.error('Error fetching notifications shared to me:', error);
    }
}

// Accept Notification
async acceptNotification(notification: any, index: any): Promise<void> {
    console.log(notification);
    if (!this.userId) return;
    try {
        await this.topicservice.updateNotificationStatus(this.userId, notification.TopicId, true, notification.TopicNotificationId);
        this.notificationsSharedToMe.splice(index, 1);
        this.toastService.success('Notification Accepted Successfully');
        await this.fetchNotifications();
        await this.fetchNotificationsSharedToMe();
        this.sharedService.triggerRefreshTopicsList();
    } catch (error) {
        this.acceptError = true;
        this.acceptSuccess = false;
        console.error('Error accepting notification:', error);
    }
}

// Decline Notification
async declineNotification(notification: any, index: any): Promise<void> {
    if (!this.userId) return;
    try {
        await this.topicservice.updateNotificationStatus(this.userId, notification.TopicId, false, notification.TopicNotificationId);
        this.notificationsSharedToMe.splice(index, 1);
        this.toastService.success('Notification Declined Successfully');
        await this.fetchNotifications();
        await this.fetchNotificationsSharedToMe();
        this.sharedService.triggerRefreshTopicsList();
    } catch (error) {
        this.declineError = true;
        this.declineSuccess = false;
        console.error('Error declining notification:', error);
    }
}

// Decline Notification Close
async declineNotificationClose(notificationId: any, index: any): Promise<void> {
    if (!this.userId) return;
    try {
        await this.topicservice.updateNotificationStatusByMe(this.userId, notificationId.TopicId, true, notificationId.TopicNotificationId);
        this.notificationsSharedByMe.splice(index, 1);
        this.toastService.success('Notification Declined Successfully');
        await this.fetchNotifications();
    } catch (error) {
        this.declineSuccess = false;
        console.error('Error closing notification:', error);
    }
}

  reloadPage() {
    location.reload();
  }
}

