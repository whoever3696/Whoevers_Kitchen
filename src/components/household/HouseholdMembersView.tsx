import { useState } from 'react';
import { Users, UserPlus, CreditCard as Edit2, Trash2, Shield, User, Crown } from 'lucide-react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useAuth } from '../../contexts/AuthContext';
import { AddDependentModal } from './AddDependentModal';
import type { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type HouseholdDependent = Database['public']['Tables']['household_dependents']['Row'];

export function HouseholdMembersView() {
  const { user } = useAuth();
  const { household, members, dependents, removeDependent } = useHousehold();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<HouseholdDependent | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === 'admin';

  useState(() => {
    const fetchProfiles = async () => {
      if (members.length === 0) return;

      setLoading(true);
      const userIds = members.map((m) => m.user_id);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (!error && data) {
        const profiles: Record<string, string> = {};
        data.forEach((profile) => {
          profiles[profile.id] = profile.display_name;
        });
        setUserProfiles(profiles);
      }
      setLoading(false);
    };

    fetchProfiles();
  });

  const handleEditDependent = (dependent: HouseholdDependent) => {
    setEditingDependent(dependent);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDependent(null);
  };

  const handleRemoveDependent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the household?`)) {
      return;
    }

    const result = await removeDependent(id);
    if (result.error) {
      alert('Failed to remove family member: ' + result.error.message);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'member':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Shield className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!household) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No household selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Household Members</h2>
          <p className="text-gray-600 mt-1">
            {members.length + dependents.length} total member{members.length + dependents.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Family Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Account Members ({members.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Members with their own accounts who can log in
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No account members</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userProfiles[member.user_id] || 'Loading...'}
                        {member.user_id === user?.id && (
                          <span className="text-gray-500 text-sm ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Members ({dependents.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Family members without their own accounts
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {dependents.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No family members added yet</p>
              {isAdmin && (
                <p className="text-sm text-gray-500">
                  Add children, partners, or other family members who don't need their own account
                </p>
              )}
            </div>
          ) : (
            dependents.map((dependent) => (
              <div key={dependent.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dependent.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {dependent.age_group && (
                          <span className="capitalize">{dependent.age_group}</span>
                        )}
                        {dependent.age_group && dependent.dietary_restrictions && <span>•</span>}
                        {dependent.dietary_restrictions && (
                          <span className="truncate max-w-xs">{dependent.dietary_restrictions}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDependent(dependent)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveDependent(dependent.id, dependent.name)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Only household admins can add or manage family members. Contact an admin if you need to make changes.
          </p>
        </div>
      )}

      <AddDependentModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editingDependent={editingDependent}
      />
    </div>
  );
}
