import React, {useState, useEffect} from 'react';
import Layout from '@theme/Layout';
import {useAuth} from '../contexts/AuthContext';
import {getSupabase} from '../lib/supabase';
import {ROLES, ROLE_LABELS} from '../lib/roles';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

function UserManagement() {
  const {isAdmin, user} = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleConfirm, setRoleConfirm] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const {data} = await sb
      .from('user_profiles')
      .select('*, manager:manager_id(id, display_name, email)')
      .order('display_name');
    setUsers(data || []);
    setLoading(false);
  }

  async function confirmRoleChange() {
    if (!roleConfirm) return;
    const {userId, newRole} = roleConfirm;
    setRoleConfirm(null);

    const sb = getSupabase();
    if (!sb) return;

    const {error} = await sb
      .from('user_profiles')
      .update({role: newRole})
      .eq('id', userId);

    if (error) {
      setActionError('Error updating role: ' + error.message);
      return;
    }

    await Promise.all([
      sb.from('audit_log').insert({
        actor_id: user.id,
        action: 'role_change',
        target_type: 'user',
        target_id: userId,
        details: {new_role: newRole},
      }),
      fetchUsers(),
    ]);
  }

  async function updateManager(userId, managerId) {
    const sb = getSupabase();
    if (!sb) return;

    const {error} = await sb
      .from('user_profiles')
      .update({manager_id: managerId || null})
      .eq('id', userId);

    if (error) {
      setActionError('Error updating manager: ' + error.message);
      return;
    }

    await Promise.all([
      sb.from('audit_log').insert({
        actor_id: user.id,
        action: 'manager_change',
        target_type: 'user',
        target_id: userId,
        details: {new_manager_id: managerId || null},
      }),
      fetchUsers(),
    ]);
  }

  if (!isAdmin) {
    return <p>Admin access required.</p>;
  }

  if (loading) return <p>Loading users...</p>;

  const filteredUsers = users.filter((u) =>
    !filter || u.display_name?.toLowerCase().includes(filter.toLowerCase())
      || u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      {actionError && (
        <div className="alert alert--danger sc-alert-mb">
          {actionError}
          <button className="button button--sm button--link sc-dismiss-btn" onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}
      <div className="sc-alert-mb">
        <input
          type="text"
          className="sc-form-input sc-form-input--search"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <table className="sc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Manager</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.display_name}</td>
              <td className="sc-text-sm">{u.email}</td>
              <td>
                <select
                  className="sc-select"
                  value={u.role}
                  onChange={(e) => setRoleConfirm({
                    userId: u.id,
                    newRole: e.target.value,
                    userName: u.display_name || u.email,
                  })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="sc-select"
                  value={u.manager_id || ''}
                  onChange={(e) => updateManager(u.id, e.target.value)}
                >
                  <option value="">No manager</option>
                  {users
                    .filter((m) => m.id !== u.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name || m.email}
                      </option>
                    ))}
                </select>
              </td>
              <td>
                <span className={u.is_active ? 'sc-status-active' : 'sc-status-inactive'}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!roleConfirm}
        title="Change user role?"
        message={roleConfirm ? `Change ${roleConfirm.userName}'s role to ${ROLE_LABELS[roleConfirm.newRole]}?` : ''}
        confirmLabel="Change Role"
        confirmStyle="warning"
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleConfirm(null)}
      />
    </div>
  );
}

function ApprovalRules() {
  const {isAdmin} = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const {data} = await sb
      .from('approval_rules')
      .select('*')
      .order('doc_path_pattern');
    setRules(data || []);
    setLoading(false);
  }

  if (!isAdmin) return null;
  if (loading) return <p>Loading rules...</p>;

  return (
    <div className="sc-section-mt">
      <h2>Approval Rules</h2>
      <table className="sc-table">
        <thead>
          <tr>
            <th>Doc Path Pattern</th>
            <th>Required Role</th>
            <th>Manager Approval</th>
            <th>Min Approvals</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id}>
              <td><code>{r.doc_path_pattern}</code></td>
              <td>{ROLE_LABELS[r.required_role] || r.required_role}</td>
              <td>{r.allow_manager_approval ? 'Yes' : 'No'}</td>
              <td>{r.min_approvals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AUDIT_PAGE_SIZE = 25;

function AuditLog() {
  const {isAdmin} = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  async function fetchLogs() {
    const sb = getSupabase();
    if (!sb) return;
    setLoading(true);
    const from = (page - 1) * AUDIT_PAGE_SIZE;
    const to = from + AUDIT_PAGE_SIZE - 1;

    const {data, count} = await sb
      .from('audit_log')
      .select('*, actor:actor_id(display_name, email)', {count: 'exact'})
      .order('created_at', {ascending: false})
      .range(from, to);

    setLogs(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }

  if (!isAdmin) return null;
  if (loading) return <p>Loading audit log...</p>;

  const totalPages = Math.ceil(totalCount / AUDIT_PAGE_SIZE);

  return (
    <div className="sc-section-mt">
      <h2>Audit Log ({totalCount} entries)</h2>
      <table className="sc-table sc-table--sm">
        <thead>
          <tr>
            <th>When</th>
            <th>Who</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.created_at).toLocaleString()}</td>
              <td>{l.actor?.display_name || l.actor?.email || 'System'}</td>
              <td><code>{l.action}</code></td>
              <td>{l.details ? JSON.stringify(l.details) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Layout title="Admin" description="User and role management">
      <div className="container sc-container-pad">
        <h1>Admin Panel</h1>
        <UserManagement />
        <ApprovalRules />
        <AuditLog />
      </div>
    </Layout>
  );
}
