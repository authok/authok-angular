import { AuthConfig, AuthClientConfig } from './auth.config';
import { AuthokClientFactory } from './auth.client';

describe('AuthokClientFactory', () => {
  describe('createClient', () => {
    it('creates a new instance of AuthokClient', () => {
      const config: AuthConfig = {
        domain: 'test.domain.com',
        clientId: 'abc123',
      };

      const configClient = new AuthClientConfig(config);
      const client = AuthokClientFactory.createClient(configClient);

      expect(client).not.toBeUndefined();
    });

    it('throws an error when no config was supplied', () => {
      const configClient = new AuthClientConfig();

      expect(() => AuthokClientFactory.createClient(configClient)).toThrowError(
        /^Configuration must be specified/
      );
    });
  });
});
