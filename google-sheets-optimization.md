# Google Sheets Quota & Performance Optimization

## Changes Implemented

### 1. Request Frequency Reduction (Caching)
- **Tool Used**: `unstable_cache` from `next/cache`.
- **Strategy**: 
  - `getSheetData` and `getSheetNames` now cache results using Next.js Data Cache.
  - **Cache Duration**: 
    - `getSheetData`: 30 seconds (`revalidate: 30`).
    - `getSheetNames`: 60 seconds (`revalidate: 60`).
  - **Impact**: Even if the client requests data every second, the Google Sheets API is only hit once every 30 seconds per unique query.
  - **Cache Invalidation**: Mutation actions (`addData`, `updateData`, etc.) automatically invalidate the cache using `revalidateTag('google-sheets')`, ensuring instant updates when data changes.

### 2. Exponential Backoff
- **Tool Used**: Custom `withRetry` helper function in `lib/google-sheets.ts`.
- **Strategy**:
  - Automatically retries failed API calls with status codes `429` (Quota Exceeded), `500`, or `503`.
  - **Backoff Logic**: 
    - Initial delay: 1000ms.
    - Multiplier: 2x.
    - Max Retries: 3.
    - Sequence: 1s -> 2s -> 4s -> fail.
  - **Scope**: Applied to all read and write operations (`get`, `append`, `update`, `batchUpdate`).

### 3. Query Optimization
- **Batch Processing**:
  - `getSheetData` fetches the entire sheet (or specified range) in a single API call (`spreadsheets.values.get` without row-by-row iteration).
  - Bulk operations (`bulkDeleteData`) use `batchUpdate` to minimize round-trips.

## Verification
- **Read Operations**: Verify that refreshing the page rapidly does not result in quota errors (caching handles this).
- **Write Operations**: Verify that adding/editing data immediately reflects on the dashboard (cache invalidation handles this).
- **Reliability**: Network glitches or temporary rate limits are handled gracefully by the retry logic.
