import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from './config.service';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }
  @Cron('* * * * *')
  keepUptime(): void {
    this.configService.setLastUpTime();
  }
}
