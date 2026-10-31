import { v4 as uuidv4 } from 'uuid';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobType = 'ai_plan_generation' | 'budget_rescue_reindex' | 'pdf_export_batch' | 'telemetry_flush';

export interface BackgroundJob<T = any, R = any> {
  id: string;
  type: JobType;
  payload: T;
  status: JobStatus;
  result?: R;
  error?: string;
  progressPercent: number;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionDurationMs?: number;
}

export class TaskQueueService {
  private jobs = new Map<string, BackgroundJob>();
  private handlers = new Map<JobType, (payload: unknown) => Promise<unknown>>();
  private isProcessing = false;

  constructor() {
    // Periodically prune completed jobs older than 2 hours
    setInterval(() => this.pruneStaleJobs(), 60 * 60 * 1000).unref();
  }

  registerHandler<T, R>(type: JobType, handler: (payload: T) => Promise<R>): void {
    this.handlers.set(type, handler as (payload: unknown) => Promise<unknown>);
  }

  enqueue<T>(type: JobType, payload: T, maxRetries = 2): BackgroundJob<T> {
    const job: BackgroundJob<T> = {
      id: `job_${uuidv4().slice(0, 12)}`,
      type,
      payload,
      status: 'pending',
      progressPercent: 0,
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    this.processNext();
    return job;
  }

  getJob(id: string): BackgroundJob | undefined {
    return this.jobs.get(id);
  }

  getMetrics() {
    const all = Array.from(this.jobs.values());
    return {
      totalJobs: all.length,
      pending: all.filter(j => j.status === 'pending').length,
      processing: all.filter(j => j.status === 'processing').length,
      completed: all.filter(j => j.status === 'completed').length,
      failed: all.filter(j => j.status === 'failed').length,
    };
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingJob = Array.from(this.jobs.values()).find(j => j.status === 'pending');
      if (!pendingJob) {
        this.isProcessing = false;
        return;
      }

      pendingJob.status = 'processing';
      pendingJob.startedAt = new Date().toISOString();
      pendingJob.progressPercent = 25;

      const handler = this.handlers.get(pendingJob.type);
      if (!handler) {
        pendingJob.status = 'failed';
        pendingJob.error = `No handler registered for job type ${pendingJob.type}`;
        this.isProcessing = false;
        this.processNext();
        return;
      }

      const startTime = Date.now();
      try {
        pendingJob.progressPercent = 50;
        const result = await handler(pendingJob.payload);
        pendingJob.status = 'completed';
        pendingJob.result = result;
        pendingJob.progressPercent = 100;
        pendingJob.completedAt = new Date().toISOString();
        pendingJob.executionDurationMs = Date.now() - startTime;
      } catch (err) {
        if (pendingJob.retryCount < pendingJob.maxRetries) {
          pendingJob.retryCount++;
          pendingJob.status = 'pending';
          pendingJob.progressPercent = 0;
        } else {
          pendingJob.status = 'failed';
          pendingJob.error = (err as Error).message;
          pendingJob.completedAt = new Date().toISOString();
          pendingJob.executionDurationMs = Date.now() - startTime;
        }
      }

      this.isProcessing = false;
      this.processNext();
    } catch {
      this.isProcessing = false;
    }
  }

  private pruneStaleJobs(): void {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [id, job] of this.jobs.entries()) {
      if (job.completedAt && new Date(job.completedAt).getTime() < twoHoursAgo) {
        this.jobs.delete(id);
      }
    }
  }
}

export const taskQueue = new TaskQueueService();
