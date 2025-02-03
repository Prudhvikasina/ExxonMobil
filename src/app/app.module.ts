import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { LoginComponent } from './login/login.component';
import { ChatbotComponent } from './dashboard/chatbot.component';
import { DialogModule } from 'primeng/dialog';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
 // Import the FormsModule
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MsalModule, MsalGuard, MsalBroadcastService, MsalService, MsalRedirectComponent, MSAL_INSTANCE, MsalInterceptorConfiguration, MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalInterceptor, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { MessagesModule } from 'primeng/messages';
import { AuthHttpInterceptor } from './common/auth-http-interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { HotToastModule } from '@ngneat/hot-toast';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { ChatMessageComponent } from './chatbox/chat-message/chat-message.component';
import { AuthInterceptor } from './auth.interceptor';
import { DocumentGeneratorComponent } from './common/document-generator/document-generator.component';
import { ActivityComponent } from './activity/activity.component';
import { AccordionModule } from 'primeng/accordion';
import { HelpdashboardComponent } from './helpdashboard/helpdashboard.component';
import { ChatmesssageDocumentrenderingComponent } from './chatbox/chatmesssage-documentrendering/chatmesssage-documentrendering.component';
import { NotificationOverlayComponent } from './notification-overlay/notification-overlay.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { PinnedTopicsComponent } from './layout/pinned-topics/pinned-topics.component';


const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;



export function loggerCallback(LogLevel: LogLevel, message: string) {

}


export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: environment.clientId,
            authority: environment.authority + environment.tenant,
            redirectUri: environment.baseUrlClient,
            postLogoutRedirectUri: '/'
        },
        cache: {
            //   cacheLocation: BrowserCacheLocation.LocalStorage,
            storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
        },
        system: {
            loggerOptions: {
                loggerCallback,
                logLevel: LogLevel.Info,
                piiLoggingEnabled: false
            }
        }
    });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', [environment.scope]); // Prod environment. Uncomment to use.
    protectedResourceMap.set(environment.baseUrlApi + '*', [environment.scope]); // Prod environment. Uncomment to use.
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: [environment.scope]
        },
        loginFailedRoute: '/login-failed'
    };

}
@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ChatbotComponent,
        ChatboxComponent,
        ActivityComponent,
        ChatMessageComponent,
        DocumentGeneratorComponent,
        HelpdashboardComponent,
        ChatmesssageDocumentrenderingComponent,
        NotificationOverlayComponent,
        AddUserComponent,
        EditUserComponent,
        UserListComponent,
        PinnedTopicsComponent,
       
    ],
    imports: [
        HttpClientModule,
        AppRoutingModule,
        AppLayoutModule,
        DialogModule,
        DataViewModule,
        CardModule,
        SidebarModule,
        StyleClassModule,
        OverlayPanelModule,
        MultiSelectModule,
        TabViewModule,
        ImageModule,
        ReactiveFormsModule,
        DropdownModule,
        CalendarModule,
        TableModule,
        TooltipModule,
        AutoCompleteModule,
        RadioButtonModule,
        BrowserAnimationsModule,
        ProgressSpinnerModule ,
        FormsModule,
        PaginatorModule,
        InputTextModule,
        InputTextareaModule,
        MessagesModule,
        ToastModule,
        HotToastModule.forRoot(),
        CommonModule,
        AccordionModule
        
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        
        { provide: LocationStrategy, useClass: HashLocationStrategy },

        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthHttpInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        },
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory
        },
        // {
        //     provide: HTTP_INTERCEPTORS,
        //     useClass: AuthInterceptor,
        //     multi: true // This ensures the interceptor is applied to all HTTP requests
        //   },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        DatePipe
    ],
    bootstrap: [AppComponent, MsalRedirectComponent 
    ],
   
})
export class AppModule { }
