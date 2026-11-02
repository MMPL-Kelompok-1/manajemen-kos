export interface RoomCardData {
  no: string;
  tipe: string;
  penghuni: string;
  durasi: string;
  tarif: string;
  status: "Terisi" | "Kosong" | "Maintenance";
  statusBayar: string;
}

export default function RoomCard({
  room,
  onClick,
}: {
  room: RoomCardData;
  onClick: () => void;
}) {
  const isKosong = room.status === "Kosong";

  return (
    <div
      onClick={onClick}
      className={`rounded-lg p-3 flex flex-col justify-between hover:bg-surface-container-high transition-all group relative cursor-pointer ${
        isKosong
          ? "bg-surface-elevated shadow-md ring-1 ring-primary/20"
          : "bg-surface-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono-data text-mono-data text-primary font-bold">
          {room.no}
        </span>
        {isKosong ? (
          <span className="px-1.5 py-0.2 rounded bg-primary text-surface font-mono-caption text-mono-caption font-bold">
            KOSONG
          </span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-status-success"></span>
        )}
      </div>

      <div className="my-2">
        <p
          className={`font-body-sm text-body-sm truncate ${isKosong ? "text-text-muted italic" : "text-primary font-medium"}`}
        >
          {isKosong ? "- Tersedia -" : room.penghuni}
        </p>
        <p className="font-mono-caption text-mono-caption text-text-subdued truncate">
          {room.tipe}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span
          className={`font-mono-caption text-mono-caption ${
            isKosong
              ? "text-primary"
              : room.statusBayar.includes("H-")
                ? "text-status-warning"
                : "text-status-success"
          }`}
        >
          {room.statusBayar}
        </span>
        <span className="material-symbols-outlined text-[16px] text-text-subdued group-hover:text-primary transition-colors">
          {isKosong ? "add" : "navigate_next"}
        </span>
      </div>
    </div>
  );
}
