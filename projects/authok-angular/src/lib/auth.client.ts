import { InjectionToken } from '@angular/core';
import { AuthokClient } from '@authok/authok-spa-js';
import { AuthClientConfig } from './auth.config';
import useragent from '../useragent';

export class AuthokClientFactory {
  static createClient(configFactory: AuthClientConfig): AuthokClient {
    const config = configFactory.get();

    if (!config) {
      throw new Error(
        'Configuration must be specified either through AuthModule.forRoot or through AuthClientConfig.set'
      );
    }

    const { redirectUri, clientId, maxAge, httpInterceptor, ...rest } = config;

    return new AuthokClient({
      redirect_uri: redirectUri || window.location.origin,
      client_id: clientId,
      max_age: maxAge,
      ...rest,
      authokClient: {
        name: useragent.name,
        version: useragent.version,
      },
    });
  }
}

export const AuthokClientService = new InjectionToken<AuthokClient>(
  'authok.client'
);
