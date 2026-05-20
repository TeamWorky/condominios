import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { PaykuConfig } from './interfaces/payku-config.interface';
import { PaykuSignatureService } from './payku-signature.service';
import { PaykuService } from './payku.service';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    {
      provide: 'PAYKU_CONFIG',
      useFactory: (configService: ConfigService): PaykuConfig => {
        const sandbox =
          configService.get<string>('PAYKU_SANDBOX', 'true') === 'true';
        return {
          publicToken: configService.get<string>('PAYKU_PUBLIC_TOKEN', ''),
          privateToken: configService.get<string>('PAYKU_PRIVATE_TOKEN', ''),
          sandbox,
          baseUrl: sandbox
            ? 'https://des.payku.cl/api'
            : 'https://app.payku.cl/api',
        };
      },
      inject: [ConfigService],
    },
    PaykuSignatureService,
    PaykuService,
  ],
  exports: [PaykuService, PaykuSignatureService],
})
export class PaykuModule {}
