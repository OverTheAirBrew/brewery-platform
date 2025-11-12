import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VesselsService } from './vessels.service';
import { QUEUE_NAME } from './vessels.abstractions';

@Processor('logic-processing-queue')
export class LogicProcessingConsumer extends WorkerHost {
  constructor(private readonly vesselsService: VesselsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      await this.vesselsService.processLogic(job.data);
    } catch (error) {
      console.error('Error processing job:', error);
      throw error; // Rethrow the error to let BullMQ handle it (e.g., retries)
    }
  }
}
