import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, Globe, Database, Mail, Key } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Settings() {
  const { user, onLogout } = useOutletContext() || {};
  
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Cài đặt hệ thống"
        subtitle="Quản lý các cấu hình hệ thống"
        user={user}
        onLogout={onLogout}
      />
      <main className="p-8">
        <div className="max-w-4xl space-y-6">
          <Card>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Bảo mật</CardTitle>
                  <CardDescription>
                    Cài đặt bảo mật và quyền truy cập
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xác thực 2 yếu tố</p>
                  <p className="text-sm text-muted-foreground">
                    Bảo vệ tài khoản bằng mã OTP
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

