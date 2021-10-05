import { SocialProviderTypeEnum } from '../dto/social-login.dto';

export type SocialUser = {
  socialProviderId: string;
  socialProvider: SocialProviderTypeEnum;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;
};

export abstract class AbstractSocialProviderAuthenticate {
  private _code: string;

  constructor(code: string) {
    this._code = code;
  }

  protected get code(): string {
    return this._code;
  }

  abstract validate(): Promise<SocialUser | null>;
}
