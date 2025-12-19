import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Users, Building2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Counters() {
  const { user, onLogout } = useOutletContext() || {};
  
  const counters = [
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
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý quầy"
        subtitle="Quản lý các quầy giao dịch"
        user={user}
        onLogout={onLogout}
      />
      <main className="p-8">
        <div className="mb-6 flex justify-between">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm quầy mới
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counters.map((counter) => (
            <Card key={counter.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{counter.name}</CardTitle>
                  <Badge variant={counter.status === "active" ? "default" : "secondary"}>
                    {counter.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{counter.code}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{counter.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{counter.employeeCount} nhân viên</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Quản lý: {counter.adminName}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Chi tiết</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

