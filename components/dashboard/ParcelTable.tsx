import StatusBadge from "../ui/StatusBadge";
import { Table } from "../ui/Table";
import { ParcelItem } from "@/types/parcelTypes";
import Tag from "../ui/Tag";
import AvatarName from "../ui/AvatarName";

type ParcelType = "incoming" | "outgoing";

interface ParcelTableProps {
  type: ParcelType;
  data: ParcelItem[];
}

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function ParcelTable({ type, data }: ParcelTableProps) {
  return (
    <Table>

      <Table.Head>
        <Table.Row>
          <Table.Cell head>Parcel ID</Table.Cell>
          <Table.Cell head>Client</Table.Cell>
          <Table.Cell head>
            {type === "incoming" ? "From" : "Destination"}
          </Table.Cell>
          <Table.Cell head>Size</Table.Cell>
          <Table.Cell head>Status</Table.Cell>
          <Table.Cell head>Fee</Table.Cell>

        </Table.Row>
      </Table.Head>

      <Table.Body data={data}>
        {(row) => (
          <>
            <Table.Cell className="min-w-26"><Tag label={row.id}/></Table.Cell>

            <Table.Cell className="min-w-34">
                <AvatarName 
                    color={row.client.avatarColor}
                    initials={row.client.initials ?? getInitials(row.client.name)}
                    name={row.client.name}
                />
            </Table.Cell>

            <Table.Cell>{row.size}</Table.Cell>

            <Table.Cell className="min-w-37">
                <Tag label={row.location}/>
            </Table.Cell>

            <Table.Cell className="capitalize">
              <StatusBadge
                status={row.status}
              />
            </Table.Cell>

            <Table.Cell className="font-bold">{row.fee}</Table.Cell>

          </>
        )}
      </Table.Body>

    </Table>
  );
}