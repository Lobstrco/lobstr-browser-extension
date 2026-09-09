// numeric: a member equal to 0 is swallowed by the `|| API_VERSION.V1` fallback
export enum API_VERSION {
    V1,
    V2,
    /** Adds the optional network on sign requests and the capability probe. */
    V3,
}
