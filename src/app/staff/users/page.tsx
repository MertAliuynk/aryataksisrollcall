"use client";

import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/alert-dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX,
  Shield,
  ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";

interface StaffUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function StaffUsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "staff"
  });

  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
    isActive: true
  });

  // API queries
  const { data: staffUsers = [], isLoading, refetch } = api.staff.getAll.useQuery();
  const createMutation = api.staff.create.useMutation();
  const updateMutation = api.staff.update.useMutation();
  const deleteMutation = api.staff.delete.useMutation();
  const toggleActiveMutation = api.staff.toggleActive.useMutation();

  const resetCreateForm = () => {
    setCreateForm({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "staff"
    });
  };

  const resetEditForm = () => {
    setEditForm({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
      isActive: true
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        username: createForm.username,
        password: createForm.password,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email || undefined,
        role: createForm.role,
      });
      
      toast.success("Kullanıcı başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Kullanıcı oluşturulurken hata oluştu");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingUser.id,
        username: editForm.username,
        password: editForm.password || undefined,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email || undefined,
        role: editForm.role,
        isActive: editForm.isActive,
      });
      
      toast.success("Kullanıcı başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetEditForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Kullanıcı güncellenirken hata oluştu");
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    try {
      await deleteMutation.mutateAsync({ id: deleteUserId });
      toast.success("Kullanıcı başarıyla silindi");
      setDeleteUserId(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Kullanıcı silinirken hata oluştu");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ 
        id: userId, 
        isActive: !isActive 
      });
      toast.success(`Kullanıcı ${!isActive ? 'aktif' : 'pasif'} hale getirildi`);
      refetch();
    } catch (error: any) {
      toast.error("Durum değiştirilirken hata oluştu");
    }
  };

  const openEditDialog = (user: StaffUser) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eğitmen Kullanıcıları</h1>
          <p className="text-gray-600">Sistemde kayıtlı eğitmen kullanıcılarını yönetin</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetCreateForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kullanıcı
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Eğitmen Kullanıcısı</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="kullanici_adi"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>

              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  placeholder="Ad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  placeholder="Soyad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-posta (İsteğe bağlı)</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Eğitmen</SelectItem>
                    <SelectItem value="admin">Yönetici</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{staffUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staffUsers.filter((user: StaffUser) => user.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Yönetici</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staffUsers.filter((user: StaffUser) => user.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {staffUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Kullanıcı bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">Başlamak için ilk kullanıcıyı oluşturun.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Kullanıcı Adı</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ad Soyad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">E-posta</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Durum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Oluşturulma</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {staffUsers.map((user: StaffUser) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.email || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role === 'admin' ? 'Yönetici' : 'Eğitmen'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? (
                            <><UserCheck className="mr-1 h-3 w-3" />Aktif</>
                          ) : (
                            <><UserX className="mr-1 h-3 w-3" />Pasif</>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Kullanıcı Adı</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-password">Yeni Şifre (Boş bırakılırsa değiştirilmez)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Yeni şifre girin"
              />
            </div>

            <div>
              <Label htmlFor="edit-firstName">Ad</Label>
              <Input
                id="edit-firstName"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-lastName">Soyad</Label>
              <Input
                id="edit-lastName"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-email">E-posta</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Eğitmen</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}