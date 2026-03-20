"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/language-context";
import { Plus, Pencil, Trash2, User, Mail, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string | null;
  _count: { requests: number };
}

const roleColors: Record<string, string> = {
  USER: "bg-orange-100 text-orange-800",
  SUPPORT: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

export function UsersManager() {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const roleLabels: Record<string, Record<string, string>> = {
    nl: {
      USER: "Gebruiker",
      SUPPORT: "Product Support",
      ADMIN: "Product Admin",
      VIEWER: "Kijker",
    },
    en: {
      USER: "User",
      SUPPORT: "Product Support",
      ADMIN: "Product Admin",
      VIEWER: "Viewer",
    },
  };

  const texts = {
    nl: {
      title: "Gebruikersbeheer",
      addUser: "Nieuwe Gebruiker",
      editUser: "Gebruiker Bewerken",
      name: "Naam",
      email: "E-mail",
      password: "Wachtwoord",
      passwordHint: "Laat leeg om ongewijzigd te laten",
      role: "Rol",
      save: "Opslaan",
      cancel: "Annuleren",
      delete: "Verwijderen",
      deleteConfirm: "Weet je zeker dat je deze gebruiker wilt verwijderen?",
      deleteWarning: "Deze actie kan niet ongedaan worden gemaakt.",
      noUsers: "Geen gebruikers gevonden",
      requests: "verzoeken",
      created: "Aangemaakt",
      userCreated: "Gebruiker aangemaakt",
      userUpdated: "Gebruiker bijgewerkt",
      userDeleted: "Gebruiker verwijderd",
      error: "Er is een fout opgetreden",
      emailExists: "Email already exists",
      lastLogin: "Laatste Login",
    },
    en: {
      title: "User Management",
      addUser: "New User",
      editUser: "Edit User",
      name: "Name",
      email: "Email",
      password: "Password",
      passwordHint: "Leave empty to keep unchanged",
      role: "Role",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this user?",
      deleteWarning: "This action cannot be undone.",
      noUsers: "No users found",
      requests: "requests",
      created: "Created",
      userCreated: "User created",
      userUpdated: "User updated",
      userDeleted: "User deleted",
      error: "An error occurred",
      emailExists: "Email already exists",
      lastLogin: "Last Login",
    },
  };

  const txt = texts[language as keyof typeof texts] || texts.en;
  const roles = roleLabels[language as keyof typeof roleLabels] || roleLabels.en;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || "",
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({ name: "", email: "", password: "", role: "USER" });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || (!selectedUser && !formData.password)) {
      toast.error(txt.error);
      return;
    }

    setSubmitting(true);

    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : "/api/users";
      const method = selectedUser ? "PATCH" : "POST";

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "Email already exists") {
          toast.error(txt.emailExists);
        } else {
          toast.error(txt.error);
        }
        return;
      }

      toast.success(selectedUser ? txt.userUpdated : txt.userCreated);
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(txt.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success(txt.userDeleted);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(txt.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{txt.title}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              {txt.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser ? txt.editUser : txt.addUser}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">{txt.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">{txt.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">
                  {txt.password}
                  {selectedUser && (
                    <span className="text-muted-foreground text-xs ml-2">({txt.passwordHint})</span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">{txt.role}</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                >
                  {Object.entries(roles).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {txt.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {txt.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{txt.noUsers}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate max-w-[150px] sm:max-w-none">{user.name || user.email}</span>
                        <Badge className={`${roleColors[user.role] || roleColors.USER} whitespace-nowrap`}>
                          {roles[user.role] || user.role}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[180px] sm:max-w-none">{user.email}</span>
                        </span>
                        <span>
                          {user._count.requests} {txt.requests}
                        </span>
                        <span className="hidden xs:inline">
                          {txt.created}: {new Date(user.createdAt).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}
                        </span>
                        {user.lastLogin && (
                          <span className="hidden sm:inline">
                            • {txt.lastLogin}: {new Date(user.lastLogin).toLocaleDateString(language === "nl" ? "nl-NL" : "en-GB")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{txt.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{txt.deleteWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{txt.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {txt.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
