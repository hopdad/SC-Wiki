import React, {useState, useEffect} from 'react';
import Layout from '@theme/Layout';
import {AuthProvider, useAuth} from '../contexts/AuthContext';
import {getSupabase} from '../lib/supabase';

const ROLES = ['viewer', 'editor', 'reviewer', 'admin'];

function UserManagement() {
  const {isAdmin, user} = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const {data} = await getSupabase()
      .from('user_profiles')
      .select('*, manager:manager_id(id, display_name, email)')
      .order('display_name');
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(userId, newRole) {
    const {error} = await getSupabase()
      .from('user_profiles')
      .update({role: newRole})
      .eq('id', userId);

    if (error) {
      alert('Error updating role: ' + error.message);
      return;
    }

    await getSupabase().from('audit_log').insert({
      actor_id: user.id,
      action: 'role_change',
      target_type: 'user',
      target_id: userId,
      details: {new_role: newRole},
    });

    fetchUsers();
  }

  async function updateManager(userId, managerId) {
    const {error} = await getSupabase()
      .from('user_profiles')
      .update({manager_id: managerId || null})
      .eq('id', userId);

    if (error) {
      alert('Error updating manager: ' + error.message);
      return;
    }

    await getSupabase().from('audit_log').insert({
      actor_id: user.id,
      action: 'manager_change',
      target_type: 'user',
      target_id: userId,
      details: {new_manager_id: managerId},
    });

    fetchUsers();
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
      <div style={{marginBottom: '1rem'}}>
        <input
          type="text"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{padding: '0.5rem', borderRadius: 4, border: '1px solid var(--ifm-color-emphasis-300)', width: 300}}
        />
      </div>
      <table style={{width: '100%'}}>
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
              <td style={{fontSize: '0.85rem'}}>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  style={{padding: '0.25rem', borderRadius: 4}}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={u.manager_id || ''}
                  onChange={(e) => updateManager(u.id, e.target.value)}
                  style={{padding: '0.25rem', borderRadius: 4}}
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
                <span style={{
                  color: u.is_active ? '#059669' : '#DC2626',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    setLoading(true);
    const {data} = await getSupabase()
      .from('approval_rules')
      .select('*')
      .order('doc_path_pattern');
    setRules(data || []);
    setLoading(false);
  }

  if (!isAdmin) return null;
  if (loading) return <p>Loading rules...</p>;

  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Approval Rules</h2>
      <table style={{width: '100%'}}>
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
              <td>{r.required_role}</td>
              <td>{r.allow_manager_approval ? 'Yes' : 'No'}</td>
              <td>{r.min_approvals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditLog() {
  const {isAdmin} = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const {data} = await getSupabase()
      .from('audit_log')
      .select('*, actor:actor_id(display_name, email)')
      .order('created_at', {ascending: false})
      .limit(50);
    setLogs(data || []);
    setLoading(false);
  }

  if (!isAdmin) return null;
  if (loading) return <p>Loading audit log...</p>;

  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Audit Log (Last 50)</h2>
      <table style={{width: '100%', fontSize: '0.85rem'}}>
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
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <Layout title="Admin" description="User and role management">
        <div className="container" style={{padding: '2rem 0'}}>
          <h1>Admin Panel</h1>
          <UserManagement />
          <ApprovalRules />
          <AuditLog />
        </div>
      </Layout>
    </AuthProvider>
  );
}
