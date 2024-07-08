import { getAssetsCached, saveAssetsCached } from "../../helpers/account";
import { getAssetString } from "../../helpers/stellar";
import { getAssetsInfo } from "@shared/api/internal";
import { AssetSimple } from "@shared/constants/types";

export async function processNewAssets(assets: AssetSimple[]) {
    const cached = await getAssetsCached();

    const cachedMap = cached.reduce((acc, asset) => {
        acc.set(getAssetString(asset), asset);
        return acc;
    }, new Map());

    const newAssets = assets.filter(
        (asset) => !cachedMap.has(getAssetString(asset)),
    );

    if (!newAssets.length) {
        return { assets: [...cachedMap.values()] };
    }

    const result = await getAssetsInfo(newAssets);

    result.forEach((info) => {
        cachedMap.set(getAssetString(info), info);
    });

    if (!cachedMap.has("XLM:undefined")) {
        cachedMap.set("XLM:undefined", {
            code: "XLM",
            issuer: undefined,
            name: "Lumens",
            image:
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjUgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOS43OTczIDUuNTQyNDlMMTcuMzk1NiA2Ljc2NjEyTDUuNzk4MTUgMTIuNjczM0M1Ljc1ODkzIDEyLjM3NDIgNS43MzkyIDEyLjA3MjggNS43MzkwOCAxMS43NzEyQzUuNzQyMyA5LjMyMjA5IDcuMDQxODYgNy4wNTc3NSA5LjE1NDg3IDUuODE5NTFDMTEuMjY3OSA0LjU4MTI3IDEzLjg3ODUgNC41NTQyMSAxNi4wMTY3IDUuNzQ4MzlMMTcuMzkxNCA1LjA0Nzk3TDE3LjU5NjUgNC45NDMzM0MxNS4wMjg4IDMuMDc5NjUgMTEuNjMyNyAyLjgxMzY5IDguODA2MTggNC4yNTQ5MUM1Ljk3OTY1IDUuNjk2MTMgNC4yMDAzNSA4LjYwMDk1IDQuMjAwNjggMTEuNzczN0M0LjIwMDY4IDExLjk4ODYgNC4yMDg4NCAxMi4yMDI3IDQuMjI1MTUgMTIuNDE1OUM0LjI3MTg4IDEzLjAzMzMgMy45NDMwOSAxMy42MTgzIDMuMzkxNCAxMy44OTk0TDIuNjY2NSAxNC4yNjkxVjE1Ljk5MzFMNC44MDA2OCAxNC45MDU0TDUuNDkxODIgMTQuNTUyNkw2LjE3MjgzIDE0LjIwNThMMTguMzk5IDcuOTc2MjRMMTkuNzcyOCA3LjI3NjY2TDIyLjYxMjUgNS44Mjk0MVY0LjEwNjJMMTkuNzk3MyA1LjU0MjQ5WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTIyLjYxMjUgNy41NTQ2OUw2Ljg2NzM1IDE1LjU3MTZMNS40OTM1MSAxNi4yNzI4TDIuNjY2NSAxNy43MTMzVjE5LjQzNTdMNS40NzQxIDE4LjAwNTNMNy44NzU3OSAxNi43ODE3TDE5LjQ4NTEgMTAuODY2MUMxOS41MjQzIDExLjE2NzIgMTkuNTQ0IDExLjQ3MDUgMTkuNTQ0MSAxMS43NzQxQzE5LjU0MjYgMTQuMjI2MSAxOC4yNDE2IDE2LjQ5MzYgMTYuMTI1NCAxNy43MzIzQzE0LjAwOTMgMTguOTcxIDExLjM5NTEgMTguOTk1MiA5LjI1NjM4IDE3Ljc5Nkw5LjE3MTk5IDE3Ljg0MDhMNy42ODE2OSAxOC42MDAzQzEwLjI0ODggMjAuNDY0IDEzLjY0NDIgMjAuNzMwNiAxNi40NzA3IDE5LjI5MDNDMTkuMjk3MyAxNy44NTAxIDIxLjA3NzMgMTQuOTQ2NCAyMS4wNzgzIDExLjc3NDFDMjEuMDc4MyAxMS41NTcyIDIxLjA2OTkgMTEuMzQwMyAyMS4wNTM4IDExLjEyNkMyMS4wMDcyIDEwLjUwODggMjEuMzM1NiA5LjkyMzk3IDIxLjg4NjggOS42NDI0NUwyMi42MTI1IDkuMjcyODNWNy41NTQ2OVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=",
            asset_string: "XLM:native",
            home_domain: "stellar.org",
            desc: "Lumens are the native digital currency of the Stellar Network built to act as a medium of exchange between other assets.",
        });
    }

    const allAssets = [...cachedMap.values()];

    await saveAssetsCached(allAssets);

    return { assets: allAssets };
}