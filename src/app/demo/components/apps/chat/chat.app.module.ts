import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { ChatAppRoutingModule } from './chat.app-routing.module';
// import { ChatAppComponent } from './chat.app.component';
// import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BadgeModule } from 'primeng/badge';
// import { UserCardComponent } from './user-card/user-card.component';
// import { ChatBoxComponent } from './chat-box/chat-box.component';
// import { ChatService } from './service/chat.service';
import { RippleModule } from 'primeng/ripple';
import { ActivityComponent } from 'src/app/activity/activity.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        // ChatAppRoutingModule,
        AvatarModule,
        InputTextModule,
        ButtonModule,
        BadgeModule,
        OverlayPanelModule,
        RippleModule
    ],
    declarations: [
        // ChatSidebarComponent,
        // ChatAppComponent,
        // UserCardComponent,
        // ChatBoxComponent,
        // ActivityComponent
    ],
    providers: [
        // ChatService
    ]
})
export class ChatAppModule { }
