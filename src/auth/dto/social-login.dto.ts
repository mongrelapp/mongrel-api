import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum SocialProviderTypeEnum {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
}

export class SocialLoginDto {
  /**
   * This field is not required when authenticating with google, github
   * @example The token you get from social provider's response
   */
  @ValidateIf(
    (o) =>
      o.socialProvider &&
      o.socialProvider !== SocialProviderTypeEnum.GOOGLE &&
      o.socialProvider !== SocialProviderTypeEnum.GITHUB,
  )
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsEnum(SocialProviderTypeEnum)
  readonly socialProvider: SocialProviderTypeEnum;

  /**
   * The code which you will get from google oauth response
   */
  @ValidateIf((o) => o.socialProvider)
  @IsNotEmpty()
  @IsString()
  readonly code?: string;
}
