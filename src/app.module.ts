import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LuckyService } from './lucky.service';
import { ConfigService } from './config.service';
import { WalletService } from './wallet.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, LuckyService, ConfigService, WalletService],
})
export class AppModule {}
