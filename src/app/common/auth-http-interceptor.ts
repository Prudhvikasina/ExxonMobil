
    

    import { Injectable } from '@angular/core';
    import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
    import { Observable, from, throwError } from 'rxjs';
    import { MsalService } from '@azure/msal-angular'; // MSAL service for authentication
    import { catchError, switchMap, tap } from 'rxjs/operators';
    import { environment } from 'src/environments/environment';
    import { Router } from '@angular/router'; // Import Router to navigate on error
    
    @Injectable()
    export class AuthHttpInterceptor implements HttpInterceptor {
    
      constructor(private authService: MsalService, private router: Router) {}
    
      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Attempt to acquire the token silently
        return from(this.authService.instance.acquireTokenSilent({
          scopes: [environment.scope]  // Replace with the required scopes for your app
        })).pipe(
          switchMap((result) => {
            // Log the acquired access token (for debugging purposes)
            // console.log('Acquired Token: ', result.accessToken); 
    
            // Clone the request and add the Authorization header
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${result.accessToken}`  // Attach the access token to the request
              }
            });
    
            // Proceed with the cloned request with Authorization header
            return next.handle(clonedRequest);
          }),
          catchError((error) => {
            // Handle the error, log it, and proceed with the original request
            console.error('Token acquisition failed: ', error);
            // Optionally, handle the error (e.g., log out the user) or proceed without a token
            return next.handle(req);  // Proceed without the token if acquisition fails
          })
        ).pipe(
          tap(event => {
            if (event instanceof HttpResponse && event.status === 200) {
              // Successfully processed response - can log or process response here
              console.log('Response successfully processed:', event);
            }
          }),
          catchError((error: HttpErrorResponse) => {
            console.log('Error occurred:', error);
    
            // Error handling based on HTTP status code
            switch (error.status) {
              case 401:
                // Unauthorized - might require re-login or showing an alert
                console.error('Unauthorized - Invalid token');
                this.router.navigate(['/shared/access-unauth']);
                break;
              case 403:
                // Forbidden - show an access denied page
                console.error('Forbidden - No permission');
                this.router.navigate(['/shared/access-denied']);
                break;
              case 404:
                // Not found - route to a 404 error page
                console.error('Page not found');
                this.router.navigate(['/shared/page-not-found']);
                break;
              case 500:
                // Server error - route to a generic error page
                console.error('Server error occurred');
                this.router.navigate(['/shared/error']);
                break;
              default:
                // Handle other status codes or do nothing
                console.error('An unknown error occurred');
                break;
            }
    
            // Propagate the error to the caller
            return throwError(() => error);
          })
        );
      }
    }
    
