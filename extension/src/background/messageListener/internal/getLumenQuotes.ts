import { getLastLumenQuotes } from "@shared/api/lobstr-api";

export async function getLumenQuotes() {
    const quotes = await getLastLumenQuotes();
    return { quotes };
}