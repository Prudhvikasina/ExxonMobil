import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { MsalService } from '@azure/msal-angular';  // MSAL service for authentication
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: MsalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Attempt to acquire the token silently
    return from(this.authService.instance.acquireTokenSilent({
      scopes: [environment.scope]  // Replace with the required scopes for your app
    })).pipe(
      switchMap((result) => {
        // console.log('Acquired Token: ', result.accessToken); // Log the access token
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${result.accessToken}` // Attach the access token to the request
          }
        });
        return next.handle(clonedRequest);  // Proceed with the cloned request with Authorization header
      }),
      catchError((error) => {
        // Handle the error, log it, and proceed with the original request
        console.error('Token acquisition failed: ', error);
        // You can choose to handle the error (e.g., log out the user, etc.) or proceed without a token
        return next.handle(req);  // Proceed without the token if acquisition fails
      })
    );
  }
}
