import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LuckyService } from './lucky.service';
import { ConfigService } from './config.service';
import { Activity } from './entities/activity.entity';
import { WalletService } from './wallet.service';
import { Withdrawal } from './entities/withdrawal.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'beans',
      entities: [Activity, Withdrawal],
      synchronize: true,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }),
    TypeOrmModule.forFeature([Activity, Withdrawal]),
  ],
  controllers: [AppController],
  providers: [AppService, LuckyService, ConfigService, WalletService],
})
export class AppModule {}
