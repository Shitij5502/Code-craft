import UpgradeButtonClient from "./UpgradeButtonClient";

// Server component wrapper – keeps pricing page as a server component
// and delegates client-side behavior (Clerk + Convex hooks) to UpgradeButtonClient.
export default function UpgradeButton() {
  return <UpgradeButtonClient />;
}
