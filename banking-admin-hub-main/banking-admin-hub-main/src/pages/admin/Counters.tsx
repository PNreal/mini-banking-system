import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Users, Edit, Trash2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getCounters, 
  getCounterStaff, 
  createCounter, 
  updateCounter, 
  deleteCounter,
  type Counter,
  type CreateCounterPayload,
  type UpdateCounterPayload
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CounterWithStaff extends Counter {
  employeeCount: number;
}

export default function Counters() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [counters, setCounters] = useState<CounterWithStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounter, setSelectedCounter] = useState<CounterWithStaff | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    counterCode: "",
    name: "",
    address: "",
    maxStaff: 10,
  });

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const role = localStorage.getItem("role") || "";
      const response = await getCounters(token, role);
      
      // Load staff count for each counter
      const countersWithStaff = await Promise.all(
        response.data.map(async (counter) => {
          try {
            const staffResponse = await getCounterStaff(token, counter.counterId);
            return {
              ...counter,
              employeeCount: staffResponse.data.length,
            };
          } catch (error) {
            return {
              ...counter,
              employeeCount: 0,
            };
          }
        })
      );
      
      setCounters(countersWithStaff);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách quầy giao dịch",
        variant: "destructive",
      });
      console.error("Failed to load counters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const role = localStorage.getItem("role") || "";
      
      const payload: CreateCounterPayload = {
        counterCode: formData.counterCode,
        name: formData.name,
        address: formData.address,
        maxStaff: formData.maxStaff,
      };

      await createCounter(token, payload, role);
      
      toast({
        title: "Thành công",
        description: "Đã tạo quầy giao dịch mới",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      loadCounters();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo quầy giao dịch",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedCounter) return;

    try {
      const token = localStorage.getItem("token") || "";
      const role = localStorage.getItem("role") || "";
      
      const payload: UpdateCounterPayload = {
        counterCode: formData.counterCode,
        name: formData.name,
        address: formData.address,
        maxStaff: formData.maxStaff,
      };

      await updateCounter(token, selectedCounter.counterId, payload, role);
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật quầy giao dịch",
      });
      
      setIsEditDialogOpen(false);
      setSelectedCounter(null);
      resetForm();
      loadCounters();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật quầy giao dịch",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCounter) return;

    try {
      const token = localStorage.getItem("token") || "";
      const role = localStorage.getItem("role") || "";
      
      await deleteCounter(token, selectedCounter.counterId, role);
      
      toast({
        title: "Thành công",
        description: "Đã xóa quầy giao dịch",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedCounter(null);
      loadCounters();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa quầy giao dịch",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (counter: CounterWithStaff) => {
    setSelectedCounter(counter);
    setFormData({
      counterCode: counter.counterCode,
      name: counter.name,
      address: counter.address,
      maxStaff: counter.maxStaff,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (counter: CounterWithStaff) => {
    setSelectedCounter(counter);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      counterCode: "",
      name: "",
      address: "",
      maxStaff: 10,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader
          title="Quản lý quầy giao dịch"
          subtitle="Thêm, sửa, xóa các quầy giao dịch"
        />
        <main className="p-8">
          <div className="text-center">Đang tải...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý quầy giao dịch"
        subtitle="Thêm, sửa, xóa các quầy giao dịch"
      />

      <main className="p-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Tổng cộng <span className="font-semibold text-foreground">{counters.length}</span> quầy giao dịch
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm quầy mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm quầy giao dịch mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cho quầy giao dịch mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã quầy *</Label>
                  <Input 
                    id="code" 
                    placeholder="VD: Q005" 
                    value={formData.counterCode}
                    onChange={(e) => setFormData({ ...formData, counterCode: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên quầy *</Label>
                  <Input 
                    id="name" 
                    placeholder="VD: Quầy Gò Vấp" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input 
                    id="address" 
                    placeholder="Nhập địa chỉ chi tiết" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxStaff">Số nhân viên tối đa *</Label>
                  <Input 
                    id="maxStaff" 
                    type="number" 
                    min="1"
                    placeholder="10" 
                    value={formData.maxStaff}
                    onChange={(e) => setFormData({ ...formData, maxStaff: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreate}>
                  Thêm quầy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật quầy giao dịch</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin quầy giao dịch
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Mã quầy *</Label>
                <Input 
                  id="edit-code" 
                  value={formData.counterCode}
                  onChange={(e) => setFormData({ ...formData, counterCode: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên quầy *</Label>
                <Input 
                  id="edit-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Địa chỉ</Label>
                <Input 
                  id="edit-address" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxStaff">Số nhân viên tối đa *</Label>
                <Input 
                  id="edit-maxStaff" 
                  type="number" 
                  min="1"
                  value={formData.maxStaff}
                  onChange={(e) => setFormData({ ...formData, maxStaff: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEdit}>
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa quầy <strong>{selectedCounter?.name}</strong>?
                <br />
                Hành động này sẽ đánh dấu quầy là không hoạt động.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {counters.map((counter, index) => (
            <Card
              key={counter.counterId}
              className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-lg animate-scale-in",
                !counter.isActive && "opacity-75"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-1 w-full",
                  counter.isActive
                    ? "bg-success"
                    : "bg-muted-foreground"
                )}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <Badge
                    variant={counter.isActive ? "default" : "secondary"}
                    className={
                      counter.isActive
                        ? "bg-success hover:bg-success/90"
                        : ""
                    }
                  >
                    {counter.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{counter.name}</CardTitle>
                <p className="text-sm font-mono text-muted-foreground">
                  {counter.counterCode}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{counter.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{counter.employeeCount} / {counter.maxStaff} nhân viên</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Admin: </span>
                  <span className="font-medium">
                    {counter.adminUserId ? "Đã chỉ định" : "Chưa có"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(counter)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => openDeleteDialog(counter)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
