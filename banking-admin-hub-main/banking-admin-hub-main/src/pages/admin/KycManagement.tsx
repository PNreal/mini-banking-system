import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getKycRequests,
  reviewKycRequest,
  KycRequest,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, RefreshCw, FileText } from "lucide-react";

function KycManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadKycRequests();
  }, [token]);

  const loadKycRequests = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await getKycRequests(token);
      // API trả về paginated response với data.content là array
      const kycData = response.data?.content || response.data || [];
      setKycRequests(Array.isArray(kycData) ? kycData : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load KYC requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: KycRequest) => {
    setSelectedRequest(request);
    setReviewStatus("APPROVED");
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!token || !selectedRequest) return;

    try {
      setSubmitting(true);
      await reviewKycRequest(token, selectedRequest.kycId, {
        status: reviewStatus,
        rejectionReason: reviewStatus === "REJECTED" ? reviewNotes : undefined,
        notes: reviewNotes,
      });

      toast({
        title: "Success",
        description: `KYC request ${reviewStatus.toLowerCase()}`,
      });

      setReviewDialogOpen(false);
      loadKycRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Review and approve KYC requests</p>
        </div>
        <Button onClick={loadKycRequests} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No KYC requests found
                </TableCell>
              </TableRow>
            ) : (
              kycRequests.map((request) => (
                <TableRow key={request.kycId}>
                  <TableCell className="font-mono">{request.userId}</TableCell>
                  <TableCell>{request.fullName}</TableCell>
                  <TableCell>{request.citizenId}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleReview(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review KYC Request</DialogTitle>
            <DialogDescription>
              Review the KYC information and approve or reject the request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm">{selectedRequest.dateOfBirth}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Citizen ID</Label>
                  <p className="text-sm">{selectedRequest.citizenId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm">{selectedRequest.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Permanent Address</Label>
                  <p className="text-sm">{selectedRequest.permanentAddress}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Current Address</Label>
                  <p className="text-sm">{selectedRequest.currentAddress}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Documents</Label>
                <div className="flex gap-2">
                  {selectedRequest.frontIdImageUrl && (
                    <a
                      href={selectedRequest.frontIdImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Front ID
                    </a>
                  )}
                  {selectedRequest.backIdImageUrl && (
                    <a
                      href={selectedRequest.backIdImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Back ID
                    </a>
                  )}
                  {selectedRequest.selfieImageUrl && (
                    <a
                      href={selectedRequest.selfieImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Selfie
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Review Decision</Label>
                <Select
                  value={reviewStatus}
                  onValueChange={(value) => setReviewStatus(value as "APPROVED" | "REJECTED")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-600" />
                        Reject
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default KycManagement;
