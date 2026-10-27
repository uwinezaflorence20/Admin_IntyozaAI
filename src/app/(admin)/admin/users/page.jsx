"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLoader2,
  TbTrash,
  TbUser,
  TbUsers,
  TbShieldCheck,
  TbMapPin,
  TbAlertCircle,
  TbX,
  TbSearch,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAllUsers, deleteUser } from "@/lib/api";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== "All") result = result.filter((u) => u.Role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.FirstName} ${u.LastName}`.toLowerCase().includes(q) ||
          u.Email.toLowerCase().includes(q) ||
          u.location?.district?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const raw = localStorage.getItem("token");
      const token = raw && raw !== "undefined" ? raw : "";
      const res = await getAllUsers(token);
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      const raw = localStorage.getItem("token");
      const token = raw && raw !== "undefined" ? raw : "";
      await deleteUser(userToDelete._id, token);
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const farmers = users.filter((u) => u.Role === "Farmer").length;
  const admins = users.filter((u) => u.Role === "Admin").length;
  const verified = users.filter((u) => u.verified).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: TbUsers, color: "bg-primary" },
          { label: "Farmers", value: farmers, icon: TbUser, color: "bg-green-500" },
          { label: "Verified", value: verified, icon: TbShieldCheck, color: "bg-accent" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-full text-white ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{loading ? "..." : stat.value}</div>
                  <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">All Users</CardTitle>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search name, email, district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/40 w-full sm:w-64"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 px-3 text-sm border border-border rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="All">All Roles</option>
              <option value="Farmer">Farmer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <TbLoader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-2">
              <TbUsers size={40} className="opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-semibold pr-4">Name</th>
                    <th className="pb-3 font-semibold pr-4">Email</th>
                    <th className="pb-3 font-semibold pr-4">Role</th>
                    <th className="pb-3 font-semibold pr-4">Location</th>
                    <th className="pb-3 font-semibold pr-4">Status</th>
                    <th className="pb-3 font-semibold pr-4">Joined</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {filtered.map((user, i) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 pr-4 font-medium text-primary whitespace-nowrap">
                          {user.FirstName} {user.LastName}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{user.Email}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              user.Role === "Admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.Role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {user.location?.district ? (
                            <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                              <TbMapPin size={13} />
                              {user.location.district}, {user.location.province}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              user.verified
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {user.verified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => confirmDelete(user)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <TbTrash size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TbAlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Delete User</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-primary">
                  {userToDelete?.FirstName} {userToDelete?.LastName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <TbLoader2 className="animate-spin" size={16} />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
