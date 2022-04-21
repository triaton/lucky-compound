import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Config } from './types';

const configFile = 'config.json';

@Injectable()
export class ConfigService {
  getIsRunning(): boolean {
    const config = this.getState();
    return config.running;
  }

  setIsRunning(isRunning = true): void {
    const config = this.getState();
    config.running = isRunning;
    this.saveState(config);
  }

  getState(): Config {
    if (!fs.existsSync(configFile)) {
      const initialConfig: Config = {
        running: true,
      };
      fs.writeFileSync(configFile, JSON.stringify(initialConfig));
    }
    return JSON.parse(fs.readFileSync(configFile, { encoding: 'utf8' }));
  }

  private saveState(config: Config): void {
    fs.writeFileSync(configFile, JSON.stringify(config));
  }
}
