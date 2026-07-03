import "dotenv/config";
import { syncAllEmployers } from "../src/lib/jobs-sync";

async function main() {
  const results = await syncAllEmployers();
  for (const result of results) {
    if (result.error) {
      console.warn(`✗ ${result.employerName}: ${result.error}`);
    } else {
      console.log(`✓ ${result.employerName}: ${result.fetched} fetched, ${result.upserted} upserted, ${result.closed} closed`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
