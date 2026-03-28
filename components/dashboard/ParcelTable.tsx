import StatusBadge from "../ui/StatusBadge";
import { Table } from "../ui/Table";
import { ParcelItem } from "@/types/parcelTypes";
import Tag from "../ui/Tag";

type ParcelType = "incoming" | "outgoing";

interface ParcelTableProps {
  type: ParcelType;
  data: ParcelItem[];
  onParcelClick?: (parcel: ParcelItem) => void;
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function ParcelTable({ type, data, onParcelClick }: ParcelTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-sm text-[#9ca3af]">
          {type === "incoming"
            ? "No incoming parcels at the moment"
            : "No outgoing parcels at the moment"}
        </div>
      </div>
    );
  }

  return (
    <Table>

      <Table.Head>
        <Table.Row>
          <Table.Cell head>Parcel ID</Table.Cell>
          <Table.Cell head>Merchant</Table.Cell>
          <Table.Cell head>
            {type === "incoming" ? "From" : "Destination"}
          </Table.Cell>
          <Table.Cell head>Size</Table.Cell>
          <Table.Cell head>Status</Table.Cell>

        </Table.Row>
      </Table.Head>

      <Table.Body data={data} onRowClick={onParcelClick}>
        {(row) => (
          <>
            <Table.Cell className="min-w-26"><Tag label={row.id}/></Table.Cell>

            <Table.Cell className="min-w-34">
              {row.merchants && row.merchants.length > 0 ? (
                <div className="space-y-0.5">
                  {row.merchants.slice(0, 2).map((m, i) => (
                    <div key={m.name + i} className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded text-[9px] font-semibold flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: m.color || "#374151" }}
                      >
                        {m.initials}
                      </div>
                      <span className="text-[11px] text-ink truncate max-w-25">{m.name}</span>
                    </div>
                  ))}
                  {row.merchants.length > 2 && (
                    <span className="text-[10px] text-ink-subtle pl-6.5">+{row.merchants.length - 2} more</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded text-[9px] font-semibold flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: row.client.avatarColor || "#374151" }}
                  >
                    {row.client.initials ?? getInitials(row.client.name)}
                  </div>
                  <span className="text-[11px] text-ink truncate max-w-25">{row.client.name}</span>
                </div>
              )}
            </Table.Cell>

            <Table.Cell>{row.location}</Table.Cell>

            <Table.Cell className="">
                <Tag label={row.size}/>
            </Table.Cell>

            <Table.Cell className="capitalize">
              <StatusBadge
                status={row.status}
              />
            </Table.Cell>

          </>
        )}
      </Table.Body>

    </Table>
  );
}