import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { LoginComponent } from './login/login.component';
import { ChatbotComponent } from './dashboard/chatbot.component';

import { MsalGuard } from '@azure/msal-angular';
import { ActivityComponent } from './activity/activity.component';
import { AccessUnauthorizedComponent } from './shared/access-unauthorized/access-unauthorized.component'
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ErrorComponent } from './shared/error/error.component';
import { ChatboxComponent } from './chatbox/chatbox.component';

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled'
};



const routes: Routes = [
    {
        path: 'shared/access-unauth',
        component: AccessUnauthorizedComponent
      },
      {
        path:'shared/access-denied',
        component: AccessDeniedComponent
      },{
        path:'shared/page-not-found',
        component:PageNotFoundComponent
      },
      {
        path:'shared/error',
        component:ErrorComponent
      },

    // { path: '', component: AppLayoutComponent },
    // {
    //     path: 'chatbot', component: ChatbotComponent,
    //     children: [
    //         {
    //             path: '', component: ChatbotComponent,
    //             canActivateChild: [MsalGuard],


    //         },
           
    //         { path: 'dashboard', loadChildren: () => import('./demo/components/dashboards/dashboards.module').then(m => m.DashboardsModule) },
    //         // z
    //         { path: 'apps', data: { breadcrumb: 'Apps' }, loadChildren: () => import('./demo/components/apps/apps.module').then(m => m.AppsModule) }
    //     ]
    // },
    {
        path: '', component: AppLayoutComponent,
        children: [
            { path: '', component: ChatbotComponent ,
            canActivateChild: [MsalGuard]},
        ]
    },
    {path: 'chatbot', component:ChatbotComponent},
    {path: 'chatbox', component:ChatboxComponent},
    {path:'activity',component:ActivityComponent},
    
    // {path:'activity',component:ActivityComponent},
    // { path: 'auth', data: { breadcrumb: 'Auth' }, loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
    // { path: 'wizard', data: { breadcrumb: 'Wizard' }, loadChildren: () => import('./demo/components/pages/wizard/wizard.module').then(m => m.WizardModule) },
   
    // { path: 'notfound', loadChildren: () => import('./demo/components/notfound/notfound.module').then(m => m.NotfoundModule) },
    // { path: 'notfound2', loadChildren: () => import('./demo/components/notfound2/notfound2.module').then(m => m.Notfound2Module) },
    // { path: '**', redirectTo: '/notfound' },

    {
        path: '',
        redirectTo: 'chatbot',
        pathMatch: 'full',
    },

    {
        path: 'code',
        component: AppLayoutComponent,

    } ,
] ;

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
