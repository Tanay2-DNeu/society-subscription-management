"use client";

import axiosIns from "@/lib/axios";
import { useEffect, useState } from "react";
import { Pencil, Trash2, UserCog } from "lucide-react";

interface Resident {
  id?: number;
  name: string;
  email: string;
  phone: string;
  status?: "pending" | "approved" | "rejected";
}

interface Flat {
  id: number;
  flat_number: string;
  block: string;
  floor: number;
  flattype: "1bhk" | "2bhk" | "3bhk";
  resident_name?: string | null;
  email?: string | null;
  phone?: string | null;
  resident?: Resident;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  status: string;
}

export default function FlatsPage() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [search, setSearch] = useState("");
  const [flatTypeFilter, setFlatTypeFilter] = useState<
    "all" | "1bhk" | "2bhk" | "3bhk"
  >("all");
  const [occupancyFilter, setOccupancyFilter] = useState<
    "all" | "occupied" | "vacant"
  >("all");
  const [sortBy, setSortBy] = useState<
    "flat_asc" | "flat_desc" | "owner" | "block" | "type"
  >("flat_asc");
  const [showModal, setShowModal] = useState(false);
  const [editFlat, setEditFlat] = useState<Flat | null>(null);
  const [assignFlat, setAssignFlat] = useState<Flat | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [assignError, setAssignError] = useState("");

  const [form, setForm] = useState({
    flat_number: "",
    block: "",
    floor: 0,
    flat_type: "1bhk" as "1bhk" | "2bhk" | "3bhk",
  });

  const fetchFlats = async () => {
    const res = await axiosIns.get("/api/flats", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      params: {
        t: Date.now(),
      },
    });
    const normalized = res.data.map((flat: Flat) => ({
      ...flat,
      resident: flat.resident_name
        ? {
            name: flat.resident_name,
            email: flat.email || "",
            phone: flat.phone || "",
          }
        : undefined,
    }));

    setFlats(normalized);
  };

  // FETCH
  useEffect(() => {
    (async () => {
      await fetchFlats();
    })();
  }, []);

  // CREATE/UPDATE FLATS
  const handleSave = async () => {
    if (editFlat) {
      await axiosIns.put(`/api/flats/${editFlat.id}`, form);
    } else {
      await axiosIns.post("/api/flats", form);
    }

    await fetchFlats();
    setShowModal(false);
    setEditFlat(null);
  };

  // DELETE FLATS
  const handleDelete = async (id: number) => {
    await axiosIns.delete(`/api/flats/${id}`);
    // Re-fetch to keep owner/resident info in sync
    await fetchFlats();
  };

  // FILTER FLATS
  const filteredFlats = flats
    .filter((f) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;

      const haystack = [
        f.flat_number,
        f.block,
        f.flattype,
        f.resident?.name,
        `${f.flat_number} ${f.block} floor ${f.floor}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .filter((f) => {
      if (flatTypeFilter === "all") return true;
      return f.flattype === flatTypeFilter;
    })
    .filter((f) => {
      if (occupancyFilter === "all") return true;
      const isOccupied = Boolean(f.resident);
      return occupancyFilter === "occupied" ? isOccupied : !isOccupied;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "flat_desc":
          return Number(b.flat_number) - Number(a.flat_number);
        case "owner":
          return (a.resident?.name || "zzz").localeCompare(
            b.resident?.name || "zzz",
          );
        case "block":
          return a.block.localeCompare(b.block) || Number(a.flat_number) - Number(b.flat_number);
        case "type":
          return a.flattype.localeCompare(b.flattype) || Number(a.flat_number) - Number(b.flat_number);
        case "flat_asc":
        default:
          return Number(a.flat_number) - Number(b.flat_number);
      }
    });

  const handleAssign = async () => {
    if (!assignFlat || !selectedUser) {
      setAssignError("Please select a resident");
      return;
    }

    try {
      setAssignError("");
      await axiosIns.post(`/api/flats/${assignFlat.id}/assign`, {
        user_id: selectedUser,
      });

      // Re-fetch to ensure owner/contact fields are never stale.
      await fetchFlats();
      setSelectedUser(null);
      setAssignFlat(null);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setAssignError(msg || "Assignment failed. Try again.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Flats</h1>
        <p className="text-sm text-gray-600">
          Manage flats, edit details, and assign residents.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <input
            placeholder="Search by flat, block, type, or owner..."
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm w-full sm:w-72 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm shadow-sm"
            value={flatTypeFilter}
            onChange={(e) =>
              setFlatTypeFilter(
                e.target.value as "all" | "1bhk" | "2bhk" | "3bhk",
              )
            }
          >
            <option value="all">All types</option>
            <option value="1bhk">1BHK</option>
            <option value="2bhk">2BHK</option>
            <option value="3bhk">3BHK</option>
          </select>

          <select
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm shadow-sm"
            value={occupancyFilter}
            onChange={(e) =>
              setOccupancyFilter(
                e.target.value as "all" | "occupied" | "vacant",
              )
            }
          >
            <option value="all">All flats</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>

          <select
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm shadow-sm"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "flat_asc"
                  | "flat_desc"
                  | "owner"
                  | "block"
                  | "type",
              )
            }
          >
            <option value="flat_asc">Flat number (Asc)</option>
            <option value="flat_desc">Flat number (Desc)</option>
            <option value="owner">Owner name</option>
            <option value="block">Block</option>
            <option value="type">Flat type</option>
          </select>
        </div>

        <button
          onClick={() => {
            setForm({
              flat_number: "",
              block: "",
              floor: 0,
              flat_type: "1bhk",
            });
            setEditFlat(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Flat
        </button>
      </div>

      <table className="w-full border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-sm font-semibold text-gray-700">
              Flat
            </th>
            <th className="p-3 text-center text-sm font-semibold text-gray-700">
              Type
            </th>
            <th className="p-3 text-center text-sm font-semibold text-gray-700">
              Owner
            </th>
            <th className="p-3 text-center text-sm font-semibold text-gray-700">
              Contact
            </th>
            <th className="p-3 text-center text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredFlats.map((flat) => (
            <tr
              key={flat.id}
              className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
            >
              <td className="p-3 text-sm text-gray-900">
                {flat.flat_number} | {flat.block} | Floor {flat.floor}
              </td>

              {/* FIXED */}
              <td className="text-center text-sm text-gray-800">
                {flat.flattype?.toUpperCase()}
              </td>

              <td className="text-center text-sm">
                {flat.resident ? flat.resident.name : "Vacant"}
              </td>

              <td className="text-center text-sm text-gray-600">
                {flat.resident ? (
                  <>
                    {flat.resident.email}
                    <br />
                    {flat.resident.phone}
                  </>
                ) : (
                  "-"
                )}
              </td>

              <td className="flex justify-center gap-3 p-3">
                <Pencil
                  size={18}
                  className="cursor-pointer text-green-600"
                  onClick={() => {
                    setEditFlat(flat);
                    setForm({
                      flat_number: flat.flat_number,
                      block: flat.block,
                      floor: flat.floor,
                      flat_type: flat.flattype,
                    });
                    setShowModal(true);
                  }}
                />

                <Trash2
                  size={18}
                  className="cursor-pointer text-red-600"
                  onClick={() => handleDelete(flat.id)}
                />

                <UserCog
                  size={18}
                  className="cursor-pointer text-blue-600"
                  onClick={async () => {
                    setAssignFlat(flat);
                    setAssignError("");
                    setSelectedUser(null);

                    const res = await axiosIns.get("/api/admin/users");

                    setUsers(res.data || []);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white shadow-xl p-6 rounded w-96 border">
            <h2 className="text-lg font-semibold mb-4">
              {editFlat ? "Edit Flat" : "Add Flat"}
            </h2>

            <input
              placeholder="Flat Number: eg. 101"
              type="text"
              max="100"
              min="0"
              className="border p-2 w-full mb-2"
              value={form.flat_number}
              onChange={(e) =>
                setForm({ ...form, flat_number: e.target.value })
              }
            />

            <input
              placeholder="Block"
              className="border p-2 w-full mb-2"
              value={form.block}
              onChange={(e) => setForm({ ...form, block: e.target.value })}
            />

            <input
              type="number"
              placeholder="Floor"
              className="border p-2 w-full mb-3"
              min="0"
              value={form.floor}
              onChange={(e) =>
                setForm({
                  ...form,
                  floor: Number(e.target.value),
                })
              }
            />

            {/* RADIO */}
            <div className="mb-4">
              <p className="text-sm mb-1">Flat Type</p>

              {["1bhk", "2bhk", "3bhk"].map((type) => (
                <label key={type} className="mr-4">
                  <input
                    type="radio"
                    value={type}
                    checked={form.flat_type === type}
                    onChange={() =>
                      setForm({ ...form, flat_type: type as Flat["flattype"] })
                    }
                  />
                  <span className="ml-1">{type.toUpperCase()}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {ASSIGNMENT MODAL} */}
      {assignFlat && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white shadow-lg p-6 rounded w-96 border">
            <h2 className="text-lg font-semibold mb-4">
              Assign Resident to {assignFlat.flat_number}
            </h2>

            <select
              className="border p-2 w-full mb-4"
              value={selectedUser ?? ""}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
            >
              <option value="">Select Resident</option>

              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.status}
                </option>
              ))}
            </select>

            {assignError && (
              <p className="text-sm text-red-600 mb-3">{assignError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignFlat(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
