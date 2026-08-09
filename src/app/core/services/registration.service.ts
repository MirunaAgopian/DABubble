import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
//transfers user-data from one page component to the other
//from register component to avatar component
export class RegistrationService {
  userData: any = {};

  setFormData(data: any) {
    this.userData = { ...this.userData, ...data };
  }

  setAvatar(avatar: string) {
    this.userData.avatar = avatar;
  }

  getFinalData() {
    return this.userData;
  }
}
