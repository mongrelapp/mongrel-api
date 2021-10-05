import { HttpService } from '@nestjs/axios';
import {
  AbstractSocialProviderAuthenticate,
  SocialUser,
} from '../interfaces/social-provider-authenticate.interface';

const axios = new HttpService();

export class FacebookSocialProvider extends AbstractSocialProviderAuthenticate {
  /**
   * Validate user
   */
  async validate(): Promise<SocialUser | null> {
    // TODO: Dependency
    return Promise.resolve(null);
  }
}
