import { useLiveQuery } from "dexie-react-hooks";
import { trashRepository } from "@/modules/trash/trash.repository";
import { Button } from "@/shared/components/ui/button";

export function TrashPage() {
  const items = useLiveQuery(() => trashRepository.listAll(), [], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Trash</h2>
          <p className="text-sm text-muted-foreground">Restore soft-deleted records or remove them permanently.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void trashRepository.emptyTrash();
          }}
          disabled={items.length === 0}
        >
          Empty Trash
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Trash is empty.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Deleted</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.entityType}:${item.id}`} className="border-t">
                  <td className="px-4 py-3 text-muted-foreground">{item.entityType}</td>
                  <td className="px-4 py-3">{item.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.deletedAt).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void trashRepository.restore(item);
                        }}
                      >
                        Restore
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void trashRepository.permanentlyDelete(item);
                        }}
                      >
                        Delete Permanently
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
