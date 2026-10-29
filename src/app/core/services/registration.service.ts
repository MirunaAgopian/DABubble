import { Injectable } from '@angular/core';

/**
 * Stores registration data between
 * registration steps.
 *
 * Used to transfer user information
 * from the registration form to avatar selection.
 */
@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  /**
   * Stores the registration data
   * collected across multiple steps.
   */
  userData: any = {};

  /**
   * Stores form data from the registration workflow.
   */
  setFormData(data: any) {
    this.userData = { ...this.userData, ...data };
  }

  /**
   * Stores the selected avatar.
   */
  setAvatar(avatarUrl: string) {
    this.userData.avatarUrl = avatarUrl;
  }

  /**
   * Returns the completed registration data.
   */
  getFinalData() {
    return this.userData;
  }
}
