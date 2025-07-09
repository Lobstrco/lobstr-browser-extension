import { cancelLoginPolling as cancelApiLoginPolling } from "@shared/api/lobstr-api";

export function cancelLoginPolling() {
    cancelApiLoginPolling();
} 