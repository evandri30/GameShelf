import { SHELF_STATUSES, STATUS_META } from "./status"

export const filters = [
    { value: "ALL", label: "All" },
    ...SHELF_STATUSES.map((status) => ({ value: status, label: STATUS_META[status].label }))
]
