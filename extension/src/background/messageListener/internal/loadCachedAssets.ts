import { getAssetsCached } from "../../helpers/account";

export async function loadCachedAssets() {
    const assets = await getAssetsCached();
    return { assets };
}
