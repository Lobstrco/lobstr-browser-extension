import { updateConnection } from "@shared/api/lobstr-api";
import { Account } from "@shared/constants/types";

export async function getUpdatedAccounts(connections: Account[]) {
    const requests = connections.map((connection: Account) => updateConnection(connection));
    const res = await Promise.all(requests);
    return res.reduce<Account[]>((acc, item, index) => item ? [...acc, {
        ...item,
        lastActivityTime: connections[index].lastActivityTime
    }] : acc, []);
}