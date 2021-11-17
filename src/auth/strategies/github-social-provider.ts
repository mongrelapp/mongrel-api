import {
  AbstractSocialProviderAuthenticate,
  SocialUser,
} from '../interfaces/social-provider-authenticate.interface';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';
import { SocialProviderTypeEnum } from '../dto/social-login.dto';

export class GithubSocialProvider extends AbstractSocialProviderAuthenticate {
  /**
   * Validate user
   */
  async validate(): Promise<SocialUser | null> {
    try {
      const accessToken: string = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${this.code}`,
        headers: {
          accept: 'application/json',
        },
      }).then((response: AxiosResponse) => {
        return response.data.access_token;
      });

      const userData = await axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
          Authorization: `token ${accessToken}`,
        },
      }).then((response) => {
        return response.data;
      });

      return {
        socialProviderId: userData.node_id,
        socialProvider: SocialProviderTypeEnum.GITHUB,
        email: userData.email || userData.login,
        firstName: userData.name || userData.login,
        lastName: '',
        avatar: userData.avatar_url,
      };
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }
}
