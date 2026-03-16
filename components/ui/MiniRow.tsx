export default function MiniRow({ id, name, status, fee }: any) {
  return (
    <div className="grid grid-cols-4 py-1 border-t border-border">
      <span>{id}</span>
      <span>{name}</span>
      <span>{status}</span>
      <span>{fee}</span>
    </div>
  );
}