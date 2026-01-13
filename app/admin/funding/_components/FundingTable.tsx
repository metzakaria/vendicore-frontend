"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Pencil, Eye, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createFunding } from "../_actions/createFunding";
import { approveFunding } from "../_actions/approveFunding";
import { updateFundingAmount } from "../_actions/updateFundingAmount";
import { getFundingRequestById } from "../_actions/getFundingRequestById";

interface FundingRequest {
  id?: string;
  funding_ref: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  source: string;
  is_approved: boolean;
  is_credited: boolean;
  is_active: boolean;
  created_at: Date | null;
  approved_at: Date | null;
  vas_merchants: {
    id: string;
    merchant_code: string;
    business_name: string;
    current_balance: string;
  };
  vas_users_vas_merchant_funding_created_byTovas_users: {
    id: string;
    username: string;
    email: string;
  };
  vas_users_vas_merchant_funding_approved_byTovas_users: {
    id: string;
    username: string;
    email: string;
  } | null;
}

interface FundingTableProps {
  fundingRequests: FundingRequest[];
  isLoading: boolean;
  error: any;
  showAddButton?: boolean;
  showMerchantSelection?: boolean;
  merchantId?: string;
  merchants?: Array<{ id: string; business_name: string; merchant_code: string }>;
  onViewDetails: (fundingRef: string) => void;
  queryKey: string[];
}

export const FundingTable = ({
  fundingRequests,
  isLoading,
  error,
  showAddButton = false,
  showMerchantSelection = false,
  merchantId,
  merchants,
  onViewDetails,
  queryKey,
}: FundingTableProps) => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState(merchantId || "");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    autoApprove: false,
  });
  
  // Edit modal state - Enhanced to include all fields
  const [editingFunding, setEditingFunding] = useState<FundingRequest | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    description: "",
    source: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // View modal state
  const [viewingFunding, setViewingFunding] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isApproved: boolean, isCredited: boolean, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (isApproved && isCredited) {
      return <Badge variant="default">Approved & Credited</Badge>;
    }
    if (isApproved) {
      return <Badge variant="default">Approved</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleAddFunding = async () => {
    if (!selectedMerchantId) {
      setModalError("Please select a merchant");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const result = await createFunding({
        merchant_id: selectedMerchantId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        source: "Admin",
        auto_approve: formData.autoApprove,
      });

      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({ amount: "", description: "", autoApprove: false });
        setSelectedMerchantId(merchantId || "");
        queryClient.invalidateQueries({ queryKey });
      } else {
        setModalError(result.error || "Failed to create funding request");
      }
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (fundingRef: string) => {
    setIsLoadingDetails(true);
    try {
      const result = await getFundingRequestById(fundingRef);
      if (result) {
        setViewingFunding(result);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching funding details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditFunding = (funding: FundingRequest) => {
    setEditingFunding(funding);
    setEditFormData({
      amount: funding.amount,
      description: funding.description,
      source: funding.source,
    });
    setIsEditModalOpen(true);
    setModalError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingFunding) return;

    // Validate amount
    const amount = parseFloat(editFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      setModalError("Please enter a valid amount greater than 0");
      return;
    }

    // Validate description
    if (!editFormData.description.trim()) {
      setModalError("Please enter a description");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      // You'll need to create this action to update all fields
      const result = await updateFundingAmount(editingFunding.funding_ref, amount);
      
      if (result.success) {
        setIsEditModalOpen(false);
        setEditingFunding(null);
        queryClient.invalidateQueries({ queryKey });
      } else {
        setModalError(result.error || "Failed to update funding");
      }
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveFunding = async (fundingRef: string) => {
    setIsSubmitting(true);
    try {
      const result = await approveFunding(fundingRef);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        setModalError(result.error || "Failed to approve funding");
      }
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Fund Button */}
      {showAddButton && (
        <div className="flex justify-end mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Fund
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add new funding request</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {!merchantId && <TableHead>Merchant</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>Loading...</TableCell>
                  <TableCell>Loading...</TableCell>
                  <TableCell>Loading...</TableCell>
                  <TableCell>Loading...</TableCell>
                  {!merchantId && <TableCell>Loading...</TableCell>}
                  <TableCell className="text-right">Loading...</TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={merchantId ? 5 : 6} className="text-center text-destructive py-8">
                  Error loading funding requests. Please try again.
                </TableCell>
              </TableRow>
            ) : fundingRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={merchantId ? 5 : 6} className="text-center text-muted-foreground py-8">
                  No funding requests found.
                </TableCell>
              </TableRow>
            ) : (
              fundingRequests.map((funding) => (
                <TableRow key={funding.funding_ref}>
                  <TableCell className="font-medium">
                    {formatCurrency(funding.amount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={funding.description}>
                    <div className="font-medium text-sm">
                        {funding.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {funding.source}
                      </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(funding.is_approved, funding.is_credited, funding.is_active)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(funding.created_at)}
                  </TableCell>
                  {!merchantId && (
                    <TableCell>
                      <div className="font-medium text-sm">
                        {funding.vas_merchants.business_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {funding.vas_merchants.merchant_code}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Button - Always available */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(funding.funding_ref)}
                            className="h-8 w-8 p-0"
                            disabled={isLoadingDetails}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>

                      {/* Edit and Approve - Only for pending requests */}
                      {!funding.is_approved && funding.is_active && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFunding(funding)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit funding details</TooltipContent>
                          </Tooltip>

                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Approve funding request</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve Funding Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to approve this funding request for{" "}
                                  <strong>{formatCurrency(funding.amount)}</strong>?
                                  <br />
                                  <br />
                                  This action will credit the merchant's account and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApproveFunding(funding.funding_ref)}
                                  disabled={isSubmitting}
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  {isSubmitting ? "Approving..." : "Approve"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {/* Disabled buttons for approved requests */}
                      {funding.is_approved && (
                        <div className="flex items-center gap-1 opacity-50">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed"
                                disabled
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cannot edit approved funding</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed text-green-600"
                                disabled
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Already approved</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Fund Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {showMerchantSelection && (
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants?.map((merchant) => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.business_name} ({merchant.merchant_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApprove"
                checked={formData.autoApprove}
                onCheckedChange={(checked) => setFormData({ ...formData, autoApprove: !!checked })}
              />
              <Label htmlFor="autoApprove" className="text-sm font-normal cursor-pointer">
                Auto-approve this funding
              </Label>
            </div>

            {modalError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setModalError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddFunding} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Fund"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Modal - All Fields */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Funding Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingFunding && (
              <>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant:</span>
                    <span className="font-medium">{editingFunding.vas_merchants.business_name}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono text-xs">{editingFunding.funding_ref}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editAmount">Amount (₦)</Label>
                  <Input
                    id="editAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {formatCurrency(editingFunding.amount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Input
                    id="editDescription"
                    placeholder="Enter description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSource">Source</Label>
                  <Select 
                    value={editFormData.source} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, source: value })}
                  >
                    <SelectTrigger id="editSource">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Online Payment">Online Payment</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {modalError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {modalError}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> You can only edit funding requests that haven't been approved yet.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setModalError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Funding Details</DialogTitle>
          </DialogHeader>
          {viewingFunding && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Reference</span>
                  <p className="text-sm text-muted-foreground font-mono">{viewingFunding.funding_ref}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Amount</span>
                  <p className="text-sm font-semibold">{formatCurrency(viewingFunding.amount)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Merchant</span>
                  <p className="text-sm">{viewingFunding.vas_merchants?.business_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Status</span>
                  <div className="mt-1">
                    {getStatusBadge(viewingFunding.is_approved, viewingFunding.is_credited, viewingFunding.is_active)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Balance Before</span>
                  <p className="text-sm">{formatCurrency(viewingFunding.balance_before)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Balance After</span>
                  <p className="text-sm">{formatCurrency(viewingFunding.balance_after)}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Description</span>
                <p className="text-sm text-muted-foreground mt-1">{viewingFunding.description}</p>
              </div>

              <div>
                <span className="text-sm font-medium">Source</span>
                <p className="text-sm text-muted-foreground mt-1">{viewingFunding.source}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Created At</span>
                  <p className="text-sm text-muted-foreground">{formatDateTime(viewingFunding.created_at)}</p>
                </div>
                {viewingFunding.approved_at && (
                  <div>
                    <span className="text-sm font-medium">Approved At</span>
                    <p className="text-sm text-muted-foreground">{formatDateTime(viewingFunding.approved_at)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};