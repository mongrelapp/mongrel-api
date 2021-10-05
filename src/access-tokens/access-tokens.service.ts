import * as moment from 'moment';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { AccessToken } from './access-token.entity';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AccessTokenService {
  /**
   * Find one
   * @param id
   */
  findOne(id: any) {
    return this.accessTokenRepo.findOne(id);
  }

  /**
   * Create access token
   * @param decodedJwtToken
   * @param user
   */
  async createToken(user: User) {
    const jwtToken = this.jwtService.sign({
      username: user.email,
      sub: user.id,
      jti: randomBytes(32).toString('hex'),
    });

    const decodedToken = this.jwtService.decode(jwtToken);

    const createdAt = moment.unix(decodedToken['iat']).toDate();
    const expiresAt = moment.unix(decodedToken['exp']).toDate();

    const accessToken = this.accessTokenRepo.create({
      id: decodedToken['jti'],
      expiresAt,
      createdAt,
      user,
    });

    await this.accessTokenRepo.save(accessToken);
    return { accessToken, jwtToken, decodedToken };
  }

  /**
   * Revoke access token using Jwt Unique Identifier
   * @param jwtUniqueIdentifier
   */
  async revokeToken(jwtUniqueIdentifier: string) {
    await this.accessTokenRepo.save(
      this.accessTokenRepo.create({
        id: jwtUniqueIdentifier,
        revoked: AccessToken.REVOKE_TOKEN,
      }),
    );
  }

  /**
   * Revoke access token using refresh token
   * @param refreshToken
   */
  async revokeTokenUsingRefreshToken(refreshToken: string) {
    getConnection()
      .query(
        `UPDATE access_token SET revoked = ?
        WHERE id = (
            SELECT accessTokenId FROM refresh_token
          WHERE id = ?
        )`,
        [AccessToken.REVOKE_TOKEN, refreshToken],
      )
      .then()
      .catch((err) => Logger.error(err));
  }

  /**
   * Revoke all access tokens of a user
   * @param userId
   */
  async revokeAllTokens(userId: number, jti: string) {
    await getConnection()
      .createQueryBuilder()
      .update(AccessToken)
      .set({ revoked: AccessToken.REVOKE_TOKEN })
      .where('userId = :userId', { userId })
      .andWhere('id != :jti', { jti })
      .execute();
  }

  /**
   * Check JWT Token validity
   * @param jwtToken
   * @return boolean
   */
  async hasTokenExpired(jwtToken: any) {
    const accessToken = await this.accessTokenRepo.findOne(jwtToken['jti']);

    const todaysDate = new Date();

    return !accessToken ||
      accessToken.revoked == AccessToken.REVOKE_TOKEN ||
      accessToken.expiresAt < todaysDate
      ? true
      : false;
  }

  constructor(
    @InjectRepository(AccessToken)
    private accessTokenRepo: Repository<AccessToken>,
    private jwtService: JwtService,
  ) {}
}
