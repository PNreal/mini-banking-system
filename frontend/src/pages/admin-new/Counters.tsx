import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Users, Edit, Trash2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Counter {
  id: string;
  code: string;
  name: string;
  address: string;
  employeeCount: number;
  status: "active" | "inactive";
  adminName: string;
}

const counters: Counter[] = [
  {
    id: "1",
    code: "Q001",
    name: "Quầy Trung tâm",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    employeeCount: 5,
    status: "active",
    adminName: "Nguyễn Văn X",
  },
  {
    id: "2",
    code: "Q002",
    name: "Quầy Thủ Đức",
    address: "456 Võ Văn Ngân, TP. Thủ Đức",
    employeeCount: 3,
    status: "active",
    adminName: "Trần Thị Y",
  },
  {
    id: "3",
    code: "Q003",
    name: "Quầy Bình Thạnh",
    address: "789 Điện Biên Phủ, Q. Bình Thạnh",
    employeeCount: 4,
    status: "inactive",
    adminName: "Lê Văn Z",
  },
  {
    id: "4",
    code: "Q004",
    name: "Quầy Quận 7",
    address: "321 Nguyễn Lương Bằng, Q.7",
    employeeCount: 6,
    status: "active",
    adminName: "Phạm Thị W",
  },
];

export default function Counters() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                  <Label htmlFor="code">Mã quầy</Label>
                  <Input id="code" placeholder="VD: Q005" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên quầy</Label>
                  <Input id="name" placeholder="VD: Quầy Gò Vấp" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input id="address" placeholder="Nhập địa chỉ chi tiết" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin">Admin quầy</Label>
                  <Input id="admin" placeholder="Tên admin quản lý" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Thêm quầy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {counters.map((counter, index) => (
            <Card
              key={counter.id}
              className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-lg animate-scale-in",
                counter.status === "inactive" && "opacity-75"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-1 w-full",
                  counter.status === "active"
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
                    variant={counter.status === "active" ? "default" : "secondary"}
                    className={
                      counter.status === "active"
                        ? "bg-success hover:bg-success/90"
                        : ""
                    }
                  >
                    {counter.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{counter.name}</CardTitle>
                <p className="text-sm font-mono text-muted-foreground">
                  {counter.code}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{counter.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{counter.employeeCount} nhân viên</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Admin: </span>
                  <span className="font-medium">{counter.adminName}</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-1 h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
