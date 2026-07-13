/**
 * Remove Selenium-generated customer accounts, keeping the KEEP_COUNT most recent.
 * Matches emails: selenium.user.<timestamp>@gmail.com | @example.com (prefix selenium.user.)
 *
 * Usage (from server/): node scripts/pruneSeleniumUsers.js
 * Dry run: DRY_RUN=1 node scripts/pruneSeleniumUsers.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Cart from "../src/models/Cart.js";
import Address from "../src/models/Address.js";

dotenv.config();

const KEEP_COUNT = 2;
const SELENIUM_EMAIL_PREFIX = /^selenium\.user\./i;

async function prune() {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const matches = await User.find({
    role: "customer",
    email: SELENIUM_EMAIL_PREFIX,
  })
    .select("_id email name createdAt")
    .sort({ createdAt: -1 })
    .lean();

  if (matches.length <= KEEP_COUNT) {
    console.log(
      `Found ${matches.length} Selenium user(s). Nothing to delete (keeping up to ${KEEP_COUNT}).`
    );
    await mongoose.disconnect();
    return;
  }

  const keep = matches.slice(0, KEEP_COUNT);
  const remove = matches.slice(KEEP_COUNT);

  console.log(`Keeping ${keep.length} (newest by createdAt):`);
  keep.forEach((u) => console.log(`  - ${u.email} (${u._id})`));
  console.log(`Removing ${remove.length}:`);
  remove.forEach((u) => console.log(`  - ${u.email} (${u._id})`));

  if (dryRun) {
    console.log("\nDRY_RUN: no changes made.");
    await mongoose.disconnect();
    return;
  }

  const removeIds = remove.map((u) => u._id);

  const [carts, addresses, usersDel] = await Promise.all([
    Cart.deleteMany({ user: { $in: removeIds } }),
    Address.deleteMany({ userId: { $in: removeIds } }),
    User.deleteMany({ _id: { $in: removeIds } }),
  ]);

  console.log(`Deleted users: ${usersDel.deletedCount}`);
  console.log(`Deleted carts: ${carts.deletedCount}`);
  console.log(`Deleted addresses: ${addresses.deletedCount}`);

  await mongoose.disconnect();
  console.log("Done.");
}

prune().catch((err) => {
  console.error(err);
  process.exit(1);
});
