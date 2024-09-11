import { DynamicModule, Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy } from './firebase.strategy.js';
import { FirebaseAuthConfig } from './firebase-auth.config.js';
import { FIREBASE_AUTH_CONFIG } from './constants.js';

@Global()
@Module({})
export class FirebaseAuthModule {
  static register(firebaseAuthConfig: FirebaseAuthConfig): DynamicModule {
    return {
      module: FirebaseAuthModule,
      imports: [PassportModule.register({ defaultStrategy: 'firebase' })],
      providers: [
        {
          provide: FIREBASE_AUTH_CONFIG,
          useValue: firebaseAuthConfig,
        },
        FirebaseStrategy,
      ],
      exports: [PassportModule, FirebaseStrategy, FIREBASE_AUTH_CONFIG],
    };
  }
}
