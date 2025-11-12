import { Inject, Injectable } from '@nestjs/common';
import { execFileSync } from 'child_process';

@Injectable()
export class Utils {
  public exeFile(file: string, args: string[] = []) {
    try {
      return execFileSync(file, args, {
        stdio: 'pipe',
        encoding: 'utf8',
      });
    } catch (err: any) {
      return undefined;
    }
  }
}
