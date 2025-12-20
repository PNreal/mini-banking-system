import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Shield, Globe, Database, Mail, Key } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Cài đặt hệ thống"
        subtitle="Quản lý các cấu hình hệ thống"
      />

      <main className="p-8">
        <div className="max-w-4xl space-y-6">
          {/* Notifications */}
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Bell className="h-5 w-5 text-info" />
                </div>
                <div>
                  <CardTitle>Thông báo</CardTitle>
                  <CardDescription>
                    Cấu hình cách nhận thông báo từ hệ thống
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo email</p>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua email về các hoạt động quan trọng
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo giao dịch lớn</p>
                  <p className="text-sm text-muted-foreground">
                    Cảnh báo khi có giao dịch vượt ngưỡng
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Báo cáo hàng ngày</p>
                  <p className="text-sm text-muted-foreground">
                    Nhận tổng hợp báo cáo cuối ngày
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Bảo mật</CardTitle>
                  <CardDescription>
                    Cài đặt bảo mật và xác thực
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xác thực 2 bước</p>
                  <p className="text-sm text-muted-foreground">
                    Bảo vệ tài khoản admin với xác thực 2 bước
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Đăng xuất tự động</p>
                  <p className="text-sm text-muted-foreground">
                    Tự động đăng xuất sau 30 phút không hoạt động
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Đổi mật khẩu</Label>
                <div className="flex gap-2">
                  <Input type="password" placeholder="Mật khẩu mới" />
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Cập nhật
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System */}
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Hệ thống</CardTitle>
                  <CardDescription>
                    Cấu hình chung của hệ thống
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên hệ thống</Label>
                  <Input defaultValue="Mini Banking System" />
                </div>
                <div className="space-y-2">
                  <Label>Ngưỡng giao dịch lớn (VNĐ)</Label>
                  <Input defaultValue="50000000" type="number" />
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Giới hạn rút tiền/ngày (VNĐ)</Label>
                  <Input defaultValue="100000000" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Giới hạn chuyển khoản/ngày (VNĐ)</Label>
                  <Input defaultValue="500000000" type="number" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Mail className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle>Email SMTP</CardTitle>
                  <CardDescription>
                    Cấu hình gửi email thông báo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input placeholder="587" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email gửi</Label>
                  <Input placeholder="noreply@minibank.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Hủy thay đổi</Button>
            <Button>Lưu cài đặt</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
