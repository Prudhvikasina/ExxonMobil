import { Injectable } from '@angular/core';
import { HttpClient, HttpParams ,HttpResponse,HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { Observable,firstValueFrom, lastValueFrom, of } from 'rxjs';
import { TopicResponse } from '../chatbot.component';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { MsalService } from '@azure/msal-angular';

import { AuthenticationResult } from '@azure/msal-browser';


@Injectable({
  providedIn: 'root'
})


export class TopicserviceService {

  private headers: HttpHeaders = new HttpHeaders();

  constructor(private http: HttpClient, private authService: MsalService) {
    this.initializeHeaders();
  }
  
  private async initializeHeaders() {
    const token = await this.getAccessToken();
    if (token) {
      this.headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
         // Add Content-Type header
    } else {
      // Handle the case where token is null (e.g., re-authenticate)
      console.error('Failed to acquire token.');
    }
  }
  
  // Method to acquire token silently
  private async getAccessToken(): Promise<string | null> {
    try {
      const result: AuthenticationResult = await this.authService.instance.acquireTokenSilent({
        scopes: [environment.scope] // Using the configured Adminscope here
      });
  
      // console.log(result);
      return result.accessToken;
    } catch (error) {
      console.log("Silent token acquisition failed. Falling back to interactive login.", error);
      return null;
    }
  }

  async notifyseen(
    userId:number
  ):Promise<any>{

    if (!this.headers.has('Authorization')) {
      await this.initializeHeaders();  // Ensure headers are initialized
    }
    const payload = {
      "UserId":userId

    }
    const url = `${environment.apiUrl}TopicsFlow/UpdateNotificationsSeen`

    return await firstValueFrom(this.http.post(url,payload,{ headers:this.headers }));
  }
  
  async getTopicList(
    requestIds: number,
    sortBy: string,
    sortOrder: string,
    userId: number,
    searchValue: string
  ): Promise<any> {
    // Ensure headers are set
    if (!this.headers.has('Authorization')) {
      await this.initializeHeaders();  // Ensure headers are initialized
    }
  
    const url = `${environment.apiUrl}LeftNav/GetAllTopicListForLeftNav?requestIds=${requestIds}&sortBy=${sortBy}&sortOrder=${sortOrder}&userId=${userId}&searchText=${searchValue}`;
    return await firstValueFrom(this.http.get(url, { headers: this.headers }));
  }
  async addtopic(obj: any, userId: string): Promise<any> {
    // const headers = this.createHeaders();
    return await firstValueFrom(this.http.post(`${environment.apiUrl}TopicsFlow/AddTopic?UserId=${userId}`, obj, { headers:this.headers }));
  }

  async topicsdata(query: string): Promise<TopicResponse> {
    // const headers = this.createHeaders();
    return await firstValueFrom(this.http.get<TopicResponse>(`${environment.apiUrl}answer?question=${query}&selectedItem=string`, { headers:this.headers }));
  }
  async updateAskLiveQuestions(requestBody: any): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/UpdateAskLiveQuestions`; 
    
    return await firstValueFrom(this.http.post<any>(url, requestBody, { headers:this.headers }));
  }
  // LLM API //
  async insertAskLiveQuestions(requestBody: any): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/InsertAskLiveQuestions`;
    // const headers = this.createHeaders();
    return await firstValueFrom(this.http.post<any>(url, requestBody, { headers:this.headers }));
  }

  // Schedule Questions //
  async insertAskScheduleQuestions(requestBody: any): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/InsertAskScheduleQuestions`;
    // const headers = this.createHeaders();
    return await firstValueFrom(this.http.post<any>(url, requestBody, { headers:this.headers }));
  }

  async searchTopicsList(searchInput: string): Promise<any> {
    // const headers = this.createHeaders();
    return await firstValueFrom(this.http.get(`${environment.apiUrl}LeftNav/SearchTopicForLeftNav?TopicName=${searchInput}`, { headers:this.headers }));
  }

  async searchVendorNames(name: string, userId: string): Promise<any> {
    // const headers = this.createHeaders();
    return await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}TopicsFlow/GetVendorName?VendorName=${name}&UserId=${userId}`, { headers:this.headers })
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
    );
  }



  async getSortingTopics(order: string): Promise<any> {
    // const headers = this.createHeaders();
    const url = `${environment.apiUrl}TopicsFlow/SortTopicsByRating?order=${order}`;
    return await firstValueFrom(this.http.get(url, { headers:this.headers }));
  }

  async getSearchTopicsLandingPage(topicName: string): Promise<any> {
    // const headers = this.createHeaders();
    const url = `${environment.apiUrl}Canvas/SearchTopic?TopicName=${topicName}`;
    return await firstValueFrom(this.http.get(url, { headers:this.headers }));
  }

  async editTopicForm(obj: any, userId: string): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/EditTopic?UserId=${userId}`;
    return await firstValueFrom(this.http.put<any>(url, obj,{headers:this.headers}));
  }

  async getAllNotifications(
    userId: number,
    showAll: number,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortOrder: string
  ): Promise<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetAllTopicsNotificationsSharedByMe?userId=${userId}&showAll=${showAll}&pageSize=${pageSize}&pageNumber=${pageNumber}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    return await firstValueFrom(this.http.get<any>(apiUrl,{headers:this.headers}));
  }

  async getAllNotificationsSharedToMe(
    userId: number,
    showAll: number,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortOrder: string
  ): Promise<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetAllTopicsNotificationsSharedToMe?UserId=${userId}&showAll=${showAll}&pageSize=${pageSize}&pageNumber=${pageNumber}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    return await firstValueFrom(this.http.get<any>(apiUrl,{headers:this.headers}));
  }

  async updateNotificationStatus(
    userId: number,
    notificationId: number,
    isAccepted: boolean,
    topicNotificationId: any
  ): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/UpdateNotificationsSharedToMe?UserId=${userId}&TopicId=${notificationId}&Isaccepted=${isAccepted}&TopicNotificationId=${topicNotificationId}`;
    const body = {};
    return await firstValueFrom(this.http.put(url, body,{headers:this.headers}));
  }

  async updateNotificationStatusByMe(
    userId: number,
    notificationId: number,
    status: boolean,
    topicNotificationId: any
  ): Promise<any> {
    const url = `${environment.apiUrl}TopicsFlow/UpdateNotificationsSharedByMe?UserId=${userId}&TopicId=${notificationId}&Status=${status}&TopicNotificationId=${topicNotificationId}`;
    const body = {};
    return await firstValueFrom(this.http.put(url, body,{headers:this.headers}));
  }

  async getTopicDetails(userId: number, topicId: number): Promise<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetTopicDetailsById?UserId=${userId}&TopicId=${topicId}`;
    return await firstValueFrom(this.http.get<any>(apiUrl,{headers:this.headers}));
  }

  async updateLikingStatus(
    userId: number,
    topicId: number,
    topicQuestionAnswerId: number,
    isLiked: number
  ): Promise<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/InsertUpdateLiking?UserId=${userId}&TopicId=${topicId}&TopicquestionanswerId=${topicQuestionAnswerId}&IsLiked=${isLiked}`;
    return await firstValueFrom(this.http.put(apiUrl, {headers:this.headers}));
  }

  async updateDisLikingStatus(
    userId: number,
    topicId: number,
    topicQuestionAnswerId: number,
    isLiked: number
  ): Promise<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/InsertUpdateDisLiking?UserId=${userId}&TopicId=${topicId}&TopicquestionanswerId=${topicQuestionAnswerId}&IsLiked=${isLiked}`;
    return await firstValueFrom(this.http.put(apiUrl, {headers:this.headers}));
  }

  async getAccessList(userId: number): Promise<Observable<any[]>> {
    const url = `${environment.apiUrl}Settings/GetAccessList?&UserId=${userId}`;
  
    return this.http.get<any[]>(url, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching access list:', err);
  
        // Log status code, status text, and headers
        if (err instanceof HttpErrorResponse) {
          console.error('Status Code:', err.status);  // Status code (e.g., 404, 500)
          console.error('Status Text:', err.statusText);  // Status text (e.g., "Not Found")
          console.error('Headers:', err.headers);  // Access response headers
        }
  
        // Return an observable with an empty array or a fallback value
        return of([]); // You can also return an empty array or a custom error object as a fallback
      })
    );
  }
  // Async method to get user roles
  async getUserRoles(): Promise<Observable<any>> {
    return this.http.get(`${environment.apiUrl}TopicsFlow/GetUserRole`, { headers: this.headers });
  }
  
  // Async method to get topic list for settings
  async getTopicListForSettings(
    searchText: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortOrder: string,
    userId: number
): Promise<any> { // Change return type to Promise<any>
    const url = `${environment.apiUrl}Settings/GetAllTopicListForSettings`;
    let params = new HttpParams()
      .set('searchText', searchText)
      .set('pageSize', pageSize.toString())
      .set('pageNumber', pageNumber.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder)
      .set('UserId', userId.toString());

    // Use lastValueFrom to convert Observable to Promise
    return lastValueFrom(this.http.get(url, { params: params, headers: this.headers }));
}
  
  // Async method to add a user
  // async addUser(name: string, email: string): Promise<Observable<any>> {
  //   // await this.initializeHeaders(); // Ensure headers are initialized
  //   // if (!this.headers) {
  //   //   console.error('Headers not initialized. Cannot make API call.');
      
  //   // }
  
  //   // const url = `${environment.apiUrl}TopicsFlow/AddUser`;
  //   // const body = { name, email };
    
  //   // return this.http.post<any>(url, body, { headers: this.headers });
  // }
  
  // Async method to update archived status
 updateIsArchived(topicId: number, userId: number, isArchived: boolean): Observable<any> {
    const url = `${environment.apiUrl}TopicsFlow/UpdateTopicStatus?TopicId=${topicId}&UserId=${userId}&isArchived=${isArchived}`;
    return this.http.put<any>(url, {}, { headers: this.headers});
  }
  
  // Async method to update deleted status
  updateIsDeleted(topicId: number, userId: number, isDeleted: boolean): Observable<any> {
    const url = `${environment.apiUrl}TopicsFlow/UpdateTopicStatus?TopicId=${topicId}&UserId=${userId}&isDeleted=${isDeleted}`;
    return this.http.put<any>(url, {}, { headers: this.headers });
  }
  
  // Async method to search users

//   searchUsers(name: string, userId?: string): Observable<any[]> {
//     const url = `${environment.apiUrl}TopicsFlow/SearchUser`;
//     const params = new HttpParams().set('name', name);
//     return this.http.get<any[]>(url, { params });
// }
searchUsers(userName: string, userId?: string): Observable<any> {
  let url = `${environment.apiUrl}TopicsFlow/SearchUser?UserName=${userName}`;
  
  if (userId) {
    url += `&UserId=${userId}`;
  }

  // Ensure headers are initialized
  return new Observable((observer) => {
    try {
      // Wait for the headers to be initialized
      this.initializeHeaders();

      // Make the GET request with headers
      this.http.get(url, { headers: this.headers }).subscribe(
        (response) => {
          observer.next(response); // Emit the response
          observer.complete(); // Complete the observable
        },
        (error) => {
          observer.error(error); // Emit error if occurs
        }
      );
    } catch (error) {
      observer.error(error); // Handle error in token acquisition or initialization
    }
  });
}


async isPinned(
  UserId:number,
  TopicId:number,
  isPinned:boolean
): Promise<any> {

  const apiUrl = `${environment.apiUrl}TopicsFlow/UpdateIsPinned?UserId=${UserId}&TopicId=${TopicId}&isPinned=${isPinned}`;

  return lastValueFrom(this.http.put<any>(apiUrl, { headers: this.headers }));

}

  async getLiveQuestions(
    UserId: number,
    TopicId: number,
    datesearch: string,
    chatsearchText: string,
    usersearch: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortOrder: string,
    
): Promise<any> { // Return type should be `Promise<any>`
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetLiveHistory?UserId=${UserId}&TopicId=${TopicId}&pageSize=${pageSize}&pageNumber=${pageNumber}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    // Use lastValueFrom to convert Observable to Promise
    return lastValueFrom(this.http.get<any>(apiUrl, { headers: this.headers }));
}
  
  // Async method to get frequently asked questions
  async FrequentlyAskedQuestions(TopicId: number): Promise<Observable<any>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetFrequentlyAskedQuestions?TopicId=${TopicId}`;
    return this.http.get<any>(apiUrl, { headers: this.headers });
  }
  
  // Async method to download a file
  async downloadFile(userId: number, topicId: number, topicQuestionAnswerId: number): Promise<Blob> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/ExportQuestionAnswerById?UserId=${userId}&TopicId=${topicId}&TopicquestionanwserId=${topicQuestionAnswerId}`;
    
    const response = await lastValueFrom(this.http.get(apiUrl, { observe: 'response', responseType: 'blob', headers: this.headers }));
    
    if (response && response.body) {
        return response.body; // Return the Blob directly
    } else {
        throw new Error('No data found'); // Handle empty response
    }
}
  
  // Async method to download a PDF file
  async downloadFilePDF(userId: number, topicId: number, topicname: string): Promise<Observable<HttpResponse<Blob>>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/ExportLiveHistoryPdf?UserId=${userId}&TopicId=${topicId}&TopicName=${topicname}`;
    return this.http.get(apiUrl, { observe: 'response', responseType: 'blob', headers: this.headers });
  }
  
  // Async method to download a DOC file
  async downloadFileDoc(userId: number, topicId: number, topicname: string): Promise<Observable<HttpResponse<Blob>>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/ExportLiveHistoryDoc?UserId=${userId}&TopicId=${topicId}&TopicName=${topicname}`;
    return this.http.get(apiUrl, { observe: 'response', responseType: 'blob', headers: this.headers });
  }
  
  // Async method to download an Excel file
  async downloadFileExcel(userId: number, topicId: number, topicname: string): Promise<Observable<HttpResponse<Blob>>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/ExportLiveHistoryExcel?UserId=${userId}&TopicId=${topicId}&TopicName=${topicname}`;
    return this.http.get(apiUrl, { observe: 'response', responseType: 'blob', headers: this.headers });
  }
  
  // Async method to get live history
  getLiveHistory(UserId: number, TopicId: number, pageSize: number, pageNumber: number, sortBy: string): Observable<any> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetLiveHistory?UserId=${UserId}&TopicId=${TopicId}&pageSize=${pageSize}&pageNumber=${pageNumber}&sortBy=${sortBy}`;
    return this.http.get<any>(apiUrl, { headers: this.headers });
  }
  
  // Async method to insert/update rating
  async insertUpdateRating(UserId: number, TopicId: number, TopicquestionanwserId: number, IsRated: boolean, Rating: number): Promise<Observable<any>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/InsertUpdateRating?UserId=${UserId}&TopicId=${TopicId}&TopicquestionanwserId=${TopicquestionanwserId}&IsRated=${IsRated}&Rating=${Rating}`;
    return await lastValueFrom(this.http.put<any>(apiUrl, {}, { headers: this.headers }));
  }

  async addNotification(userId:number,selectedUsers:any,TopicId:number): Promise<Observable<any>> {
    const apiUrl = `${environment.apiUrl}TopicsFlow/add_topic_notification`

    const obj = {
      userId:userId,
      selectedUsers:selectedUsers,
      topicId:TopicId
    }
   
      
    return await lastValueFrom(this.http.post<any>(apiUrl,obj,{headers:this.headers}))
  }
  async getNotifications(payload: any, userId: number): Promise<Observable<any>> {

    const apiUrl = `${environment.apiUrl}TopicsFlow/GetNotifications?UserId=${userId}`;
    

    return await lastValueFrom(this.http.post<any>(apiUrl, payload,{headers:this.headers}));
  }

  async getNotificationssharedbyme(payload: any, userId: number): Promise<Observable<any>> {

    const apiUrl = `${environment.apiUrl}TopicsFlow/GetNotificationsSharedByMe?UserId=${userId}`;
    

    return await lastValueFrom(this.http.post<any>(apiUrl, payload,{headers:this.headers}));
  }


  async updateNotifications(payload: any): Promise<Observable<any>> {

    const apiUrl = `${environment.apiUrl}TopicsFlow/UpdateNotifications`;
    

    return await lastValueFrom(this.http.post<any>(apiUrl, payload,{headers:this.headers}));
  }


  async getLanguages(UserId:number,TopicId:number): Promise<Observable<any>> {
    // GetLanguages?UserId=1&TopicId=12
    const apiUrl = `${environment.apiUrl}TopicsFlow/GetLanguages`;
    const params = new HttpParams()
      .set('UserId', UserId)
      .set('TopicId', TopicId);
    return await lastValueFrom(this.http.get<any>(apiUrl,{params,headers:this.headers}))
  }
  
  // Async method to get featured topic list
  async getFeaturedTopicList(sortOption: string, userId: number): Promise<Observable<any>> {
    const apiUrl = `${environment.apiUrl}Canvas/GetAllFeaturedTopicListForLandingZoneByRating`;
    const params = new HttpParams()
      .set('sortbyRating', sortOption)
      .set('UserId', userId.toString());
    return await lastValueFrom(this.http.get<any>(apiUrl, { params, headers: this.headers }));
  }

  // checkingemail(email:string){

  //   // const apiUrl = ``
  //   console.log(email)
  // }

  // getUserRolesLeftNav(TopicId : number, UserId: number): Observable<any> {
  //   console.log('at service', TopicId)
  //   const apiUrl = `${environment.apiUrl}TopicsFlow/GetTopicDetailsById?UserId=${UserId}&TopicId=${TopicId}`;
  //   return this.http.get<any>(apiUrl);
  // }
  
  // getcardinfo() {
  //   return this.http.get(`${environment.apiUrl}card`);
  // }

  // addtopicsdata() {
  //   return this.http.get(`${environment.apiUrl}addtopicsdata`);
  // }

  // getAllTopicQuestionsByUser(pageSize: number, pageNumber: number, sortOption: string,TopicId: number ): Observable<any> {
  //   let params = new HttpParams();
  //   params = params.set('pageSize', pageSize.toString());
  //   params = params.set('pageNumber', pageNumber.toString());
  //   params = params.set('sortbyUser', sortOption);
  //   params = params.set('TopicId', TopicId.toString());
  //   const apiUrl = `${environment.apiUrl}Canvas/GetAllTopicQuestionsByUser`;
  //   return this.http.get(apiUrl, { params });
  // }
  // getAllTopicQuestionsByDate(pageSize: number, pageNumber: number, sortOption: string, userId: number, topicId: number): Observable<any> {
  //   let params = new HttpParams();
  //   params = params.set('pageSize', pageSize.toString());
  //   params = params.set('pageNumber', pageNumber.toString());
  //   params = params.set('sortbyDate', sortOption);
  //   params = params.set('UserId', userId.toString());
  //   params = params.set('TopicId', topicId.toString());
  //   const apiUrl = `${environment.apiUrl}Canvas/GetAllTopicQuestionsByDate`;
  //   return this.http.get(apiUrl, { params });
  // }





  

    // getVendorNames(): Observable<any> {
  //   return this.http.get<any>('${environment.apiUrl}TopicsFlow/GetVendorName');
  // }
//  getregionnumbers(regionnumber:string){
//   return this.http.get('${environment.apiUrl}TopicsFlow/GetRegion?RegionId=' + `${regionnumber}`+'&UserId=1')
//   .pipe(
//     debounceTime(300), // Wait for 300 milliseconds after the last keystroke
//     distinctUntilChanged() // Only emit if the value has changed
//   );
//  }
 
// getAllTopicListForLandingZone(searchText: string, sortBy: string,  sortOrder: string, userId: number): Observable<any> {
//   const url = `${environment.apiUrl}Canvas/GetAllFeaturedTopicListForLandingZone`;
//   let params = new HttpParams();
//   params = params.append('searchText', searchText);
//   params = params.append('sortBy', sortBy);
//   params = params.append('sortOrder', sortOrder);
//   params = params.append('UserId', userId.toString());
//   console.log(params)
//   return this.http.get(url, { params: params });
// }




  // getregionnumbers(regionName: string,userId: string): Observable<any> {
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetRegion?RegionName=` + encodeURIComponent(regionName) + '&UserId=' + `${userId}`)
  //     .pipe(
  //       debounceTime(300), 
  //       distinctUntilChanged() 
  //     );
  // }
  //  getdepartmentnumber(Deptnumber:string,userId: string){
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetDepartmentNumber?DepartmentNumber=` + `${Deptnumber}`+'&UserId=' + `${userId}`)
  //   .pipe(
  //     debounceTime(300), 
  //     distinctUntilChanged() 
  //   );
  //  }
  //  getItemnumber(Itemnumber:string,userId: string){
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetItemNumber?ItemNumber=` + `${Itemnumber}`+'&UserId=' + `${userId}`)
  //   .pipe(
  //     debounceTime(300), 
  //     distinctUntilChanged() 
  //   );
  //  }
  //  getcliamcatagory(CliamCatagory:string,userId: string){
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetClaimCategory?ClaimCategory=` + `${CliamCatagory}`+'&UserId=' + `${userId}`)
  //   .pipe(
  //     debounceTime(300), 
  //     distinctUntilChanged() 
  //   );
  //  }
  //  getcliamtype(Cliamtype:string,userId: string){
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetClaimType?ClaimType=` + `${Cliamtype}`+'&UserId=' + `${userId}`)
  //   .pipe(
  //     debounceTime(300), 
  //     distinctUntilChanged() 
  //   );
  //  }
  //  getVendarNumber(VendorNumber:string,userId: string){
  //   return this.http.get(`${environment.apiUrl}TopicsFlow/GetVendorNumber?VendorNumber=` + `${VendorNumber}`+'&UserId=' + `${userId}`)
  //   .pipe(
  //     debounceTime(300), 
  //     distinctUntilChanged() 
  //   );
  //  }









}

















