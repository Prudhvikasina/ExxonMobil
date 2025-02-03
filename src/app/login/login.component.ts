import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
};
constructor(private router: Router) {}

    login() {
        // Check if the provided credentials match the allowed credentials
        if (this.loginData.username === 'davidlynch@cprs-inc.com' && this.loginData.password === '123456') {
            // Redirect to the layout page if credentials match
            this.router.navigate(['/layout']);
        } else {
            // Show error message or handle invalid credentials
            console.log('Invalid username or password');
        }
    }
    
}
