import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

export default function OfflineBanner({ syncedAt }) {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span className="font-semibold">OFFLINE</span>
      <span>
        Showing last synchronized information
        {syncedAt ? ` (as of ${new Date(syncedAt).toLocaleString()})` : ""}.
      </span>
    </div>
  );
}
