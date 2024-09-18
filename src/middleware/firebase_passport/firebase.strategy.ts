import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { DecodedIdToken } from './decoded-id-token.js';
import { Inject, Injectable } from '@nestjs/common';
import { FIREBASE_AUTH_CONFIG } from './constants.js';
import { FirebaseAuthConfig } from './firebase-auth.config.js';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(
    @Inject(FIREBASE_AUTH_CONFIG) { issuer, audience }: FirebaseAuthConfig,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
          'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
      }),
      issuer,
      audience,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
    });
  }

  validate(payload: DecodedIdToken): any | Promise<any> {
    return payload;
  }
}
