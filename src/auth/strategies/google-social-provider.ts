import {
  AbstractSocialProviderAuthenticate,
  SocialUser,
} from '../interfaces/social-provider-authenticate.interface';
import { OAuth2Client } from 'google-auth-library';
import { Logger } from '@nestjs/common';
import { SocialProviderTypeEnum } from '../dto/social-login.dto';

export class GoogleSocialProvider extends AbstractSocialProviderAuthenticate {
  /**
   * Validate user
   */
  async validate(): Promise<SocialUser | null> {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      const url = client.generateAuthUrl({
        scope: ['openid', 'email', 'profile'],
      });

      console.log(url);

      const { tokens } = await client.getToken(this.code);

      client.setCredentials(tokens);

      // const result = await client.request({ url });

      // console.log(result.data);

      const { data } = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      return {
        socialProviderId: data['sub'],
        socialProvider: SocialProviderTypeEnum.GOOGLE,
        email: data['email'],
        firstName: data['given_name'],
        lastName: data['family_name'],
        avatar: data['picture'],
      };
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }
}
