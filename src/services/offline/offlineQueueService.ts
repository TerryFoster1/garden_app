export type OfflineMutationType = "complete-task" | "add-plant" | "add-photo" | "add-observation" | "update-care-task";

export type OfflineMutation = {
  id: string;
  type: OfflineMutationType;
  createdAt: string;
  payload: Record<string, unknown>;
  status: "queued" | "syncing" | "synced" | "failed";
};

export type OfflineQueueService = {
  enqueue(mutation: Omit<OfflineMutation, "id" | "createdAt" | "status">): OfflineMutation;
  listQueued(): OfflineMutation[];
  markSynced(id: string): void;
  markFailed(id: string): void;
};

export function createInMemoryOfflineQueueService(): OfflineQueueService {
  const queue: OfflineMutation[] = [];

  return {
    enqueue(mutation) {
      const queued: OfflineMutation = {
        ...mutation,
        id: `offline-${Date.now()}-${queue.length}`,
        createdAt: new Date().toISOString(),
        status: "queued"
      };

      queue.unshift(queued);
      return queued;
    },
    listQueued() {
      return queue.filter((mutation) => mutation.status === "queued" || mutation.status === "failed");
    },
    markSynced(id) {
      const mutation = queue.find((item) => item.id === id);
      if (mutation) {
        mutation.status = "synced";
      }
    },
    markFailed(id) {
      const mutation = queue.find((item) => item.id === id);
      if (mutation) {
        mutation.status = "failed";
      }
    }
  };
}

export const inMemoryOfflineQueueService = createInMemoryOfflineQueueService();

