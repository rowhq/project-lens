"use client";

import { useState } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  Users,
  Plus,
  Mail,
  MoreVertical,
  Shield,
  UserCheck,
  Clock,
  X,
  Send,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/shared/components/common/EmptyState";

type MemberRole = "CLIENT" | "APPRAISER" | "ADMIN";

const roleLabels: Record<
  MemberRole,
  { label: string; color: string; description: string }
> = {
  CLIENT: {
    label: "Member",
    color: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
    description: "Can create and manage appraisals",
  },
  APPRAISER: {
    label: "Appraiser",
    color: "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30",
    description: "Field appraiser",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-amber-400/10 text-amber-400 border border-amber-400/30",
    description: "Full access to all features",
  },
};

const availableRoles: { value: MemberRole; label: string }[] = [
  { value: "CLIENT", label: "Member" },
  { value: "ADMIN", label: "Admin" },
];

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(
    null,
  );
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: organization, refetch: refetchOrg } =
    trpc.organization.get.useQuery();
  const { data: members, refetch: refetchMembers } =
    trpc.organization.members.list.useQuery();
  const { data: pendingInvitations, refetch: refetchPending } =
    trpc.organization.members.pending.useQuery();

  const utils = trpc.useUtils();

  const inviteMember = trpc.organization.members.invite.useMutation({
    onSuccess: () => {
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      refetchMembers();
      refetchPending();
      showFeedback("success", "Invitation sent successfully!");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const removeMember = trpc.organization.members.remove.useMutation({
    onSuccess: () => {
      refetchMembers();
      setShowRemoveConfirm(null);
      setActiveMenu(null);
      showFeedback("success", "Member removed successfully");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const changeRole = trpc.organization.members.changeRole.useMutation({
    onSuccess: () => {
      refetchMembers();
      setShowRoleDropdown(null);
      setActiveMenu(null);
      showFeedback("success", "Role updated successfully");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const updateOrganization = trpc.organization.update.useMutation({
    onSuccess: () => {
      refetchOrg();
      setShowEditOrgModal(false);
      showFeedback("success", "Organization updated successfully");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const resendInvite = trpc.organization.members.resendInvite.useMutation({
    onSuccess: () => {
      showFeedback("success", "Invitation resent successfully!");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const cancelInvite = trpc.organization.members.cancelInvite.useMutation({
    onSuccess: () => {
      refetchPending();
      showFeedback("success", "Invitation cancelled");
    },
    onError: (error) => {
      showFeedback("error", error.message);
    },
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleInvite = () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) return;
    inviteMember.mutate({
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
    });
  };

  const handleEditOrg = () => {
    if (organization) {
      setOrgName(organization.name);
      setOrgPhone(organization.phone || "");
      setShowEditOrgModal(true);
    }
  };

  const handleSaveOrg = () => {
    updateOrganization.mutate({
      name: orgName,
      phone: orgPhone || undefined,
    });
  };

  const handleRoleChange = (userId: string, newRole: MemberRole) => {
    changeRole.mutate({ userId, role: newRole as "CLIENT" | "ADMIN" });
  };

  const handleRemoveMember = (userId: string) => {
    removeMember.mutate({ userId });
  };

  // Filter active members (exclude pending)
  const activeMembers = members?.filter((m) => m.status === "ACTIVE") || [];

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 clip-notch shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-lime-400 text-black"
              : "bg-red-500 text-[var(--foreground)]"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Team</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your organization members
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider px-5 py-3 clip-notch hover:bg-lime-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Organization Info */}
      <div className="relative bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
              <Users className="w-8 h-8 text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {organization?.name}
              </h2>
              <p className="text-[var(--muted-foreground)]">
                {activeMembers.length} active member
                {activeMembers.length !== 1 ? "s" : ""}
                {pendingInvitations && pendingInvitations.length > 0 && (
                  <span className="text-amber-400">
                    {" "}
                    ({pendingInvitations.length} pending)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleEditOrg}
            className="text-lime-400 hover:text-lime-300 text-sm font-mono uppercase tracking-wider flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit Organization
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="relative bg-[var(--card)] clip-notch border border-[var(--border)]">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">Members</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {activeMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members yet"
              description="Invite colleagues to collaborate on appraisals and share reports"
              action={{
                label: "Invite Member",
                onClick: () => setShowInviteModal(true),
              }}
            />
          ) : (
            activeMembers.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-[var(--foreground)] font-medium">
                      {member.firstName?.[0]}
                      {member.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 clip-notch-sm text-xs font-mono uppercase tracking-wider ${
                      roleLabels[member.role as MemberRole]?.color ||
                      "bg-gray-500/20 text-[var(--muted-foreground)]"
                    }`}
                  >
                    {roleLabels[member.role as MemberRole]?.label ||
                      member.role}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <UserCheck className="w-4 h-4 text-lime-400" />
                    Active
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === member.id ? null : member.id,
                        )
                      }
                      className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
                    >
                      <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </button>
                    {activeMenu === member.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] clip-notch shadow-lg border border-[var(--border)] py-1 z-10">
                        {/* Change Role Submenu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowRoleDropdown(
                                showRoleDropdown === member.id
                                  ? null
                                  : member.id,
                              )
                            }
                            className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Change Role
                          </button>
                          {showRoleDropdown === member.id && (
                            <div className="absolute left-full top-0 ml-1 w-36 bg-[var(--card)] clip-notch shadow-lg border border-[var(--border)] py-1">
                              {availableRoles.map((role) => (
                                <button
                                  key={role.value}
                                  onClick={() =>
                                    handleRoleChange(member.id, role.value)
                                  }
                                  disabled={changeRole.isPending}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--secondary)] flex items-center gap-2 ${
                                    member.role === role.value
                                      ? "text-lime-400 font-medium"
                                      : "text-[var(--foreground)]"
                                  }`}
                                >
                                  {member.role === role.value && (
                                    <Check className="w-4 h-4" />
                                  )}
                                  {role.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setShowRemoveConfirm(member.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Member
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="relative bg-[var(--card)] clip-notch border border-[var(--border)]">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">
            Pending Invitations
          </h3>
        </div>
        {!pendingInvitations || pendingInvitations.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">
            <Mail className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
            <p>No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {pendingInvitations.map((invite) => (
              <div
                key={invite.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 clip-notch-sm flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {invite.firstName} {invite.lastName}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {invite.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Sent {new Date(invite.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => resendInvite.mutate({ userId: invite.id })}
                    disabled={resendInvite.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-lime-400 hover:bg-lime-400/10 clip-notch-sm disabled:opacity-50"
                  >
                    {resendInvite.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Resend
                  </button>
                  <button
                    onClick={() => cancelInvite.mutate({ userId: invite.id })}
                    disabled={cancelInvite.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 clip-notch-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roles & Permissions */}
      <div className="relative bg-[var(--card)] clip-notch border border-[var(--border)]">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--foreground)]">
            Roles & Permissions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(roleLabels).map(([role, config]) => (
              <div
                key={role}
                className="border border-[var(--border)] clip-notch p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <span
                    className={`px-2 py-1 clip-notch-sm text-xs font-mono uppercase tracking-wider ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {config.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Invite Team Member
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
                aria-label="Close invite modal"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2.5 border border-[var(--border)] clip-notch font-mono text-sm uppercase tracking-wider hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={
                  !inviteEmail ||
                  !inviteFirstName ||
                  !inviteLastName ||
                  inviteMember.isPending
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed transition-colors"
              >
                {inviteMember.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Edit Organization
              </h2>
              <button
                onClick={() => setShowEditOrgModal(false)}
                className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
                aria-label="Close edit organization modal"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400/50"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Billing address can be updated in the Billing page
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditOrgModal(false)}
                className="flex-1 px-4 py-2.5 border border-[var(--border)] clip-notch font-mono text-sm uppercase tracking-wider hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrg}
                disabled={!orgName || updateOrganization.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed transition-colors"
              >
                {updateOrganization.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 clip-notch-sm flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Remove Member
              </h2>
            </div>

            <p className="text-[var(--muted-foreground)] mb-6">
              Are you sure you want to remove this member from your
              organization? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveConfirm(null);
                  setActiveMenu(null);
                }}
                className="flex-1 px-4 py-2.5 border border-[var(--border)] clip-notch font-mono text-sm uppercase tracking-wider hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveConfirm)}
                disabled={removeMember.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-[var(--foreground)] font-mono text-sm uppercase tracking-wider clip-notch hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {removeMember.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
