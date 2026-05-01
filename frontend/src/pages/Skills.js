import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SkillCard from '../components/SkillCard';

const Skills = () => {
  const [activeTab, setActiveTab] = useState('my');
  const [userSkills, setUserSkills] = useState([]);
  const [library, setLibrary] = useState([]);
  const [filteredLibrary, setFilteredLibrary] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLibrarySkill, setSelectedLibrarySkill] = useState(null);
  const [addForm, setAddForm] = useState({ proficiencyLevel: 'Beginner', status: 'Offering', experienceNotes: '' });
  const [showNewSkillForm, setShowNewSkillForm] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({ skillName: '', category: '', detailedDescription: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUserSkills(); fetchLibrary(); }, []);

  useEffect(() => {
    let filtered = library;
    if (search) filtered = filtered.filter((s) => s.skillName.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) filtered = filtered.filter((s) => s.category === categoryFilter);
    setFilteredLibrary(filtered);
  }, [search, categoryFilter, library]);

  const fetchUserSkills = async () => {
    try { const res = await api.get('/skills/user'); setUserSkills(res.data.data); } catch (err) { console.error(err); }
  };

  const fetchLibrary = async () => {
    try { const res = await api.get('/skills/library'); setLibrary(res.data.data); setFilteredLibrary(res.data.data); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill from your profile?')) return;
    try {
      await api.delete(`/skills/user/${id}`);
      setUserSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete skill'); }
  };

  const openAddModal = (skill) => {
    setSelectedLibrarySkill(skill);
    setAddForm({ proficiencyLevel: 'Beginner', status: 'Offering', experienceNotes: '' });
    setShowAddModal(true);
    setError('');
  };

  const handleAddSkill = async () => {
    try {
      await api.post('/skills/user', { skillId: selectedLibrarySkill._id, ...addForm });
      setSuccess('Skill added to your profile!');
      setTimeout(() => setSuccess(''), 3000);
      setShowAddModal(false);
      fetchUserSkills();
    } catch (err) { setError(err.response?.data?.error || 'Failed to add skill'); }
  };

  const handleCreateLibrarySkill = async () => {
    if (!newSkillForm.skillName || !newSkillForm.category) { setError('Skill name and category are required'); return; }
    try {
      await api.post('/skills/library', newSkillForm);
      setSuccess('Skill added to library!');
      setTimeout(() => setSuccess(''), 3000);
      setShowNewSkillForm(false);
      setNewSkillForm({ skillName: '', category: '', detailedDescription: '' });
      fetchLibrary();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create skill'); }
  };

  const categories = [...new Set(library.map((s) => s.category))].sort();

  return (
    <div className="page-container">
      <h1 className="page-heading mb-6">Skills</h1>

      {success && <div className="alert-success mb-4">{success}</div>}
      {error && <div className="alert-error mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'my', label: `My Skills (${userSkills.length})` },
          { id: 'library', label: `Skill Library (${library.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* My Skills tab */}
      {activeTab === 'my' && (
        userSkills.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <div className="text-6xl mb-4" aria-hidden="true">🎯</div>
            <p className="text-lg font-medium">No skills added yet</p>
            <button onClick={() => setActiveTab('library')} className="mt-3 text-primary-600 dark:text-primary-400 hover:underline text-sm">
              Browse the library to add skills →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((us) => <SkillCard key={us._id} userSkill={us} onDelete={handleDelete} />)}
          </div>
        )
      )}

      {/* Library tab */}
      {activeTab === 'library' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <input
              type="text"
              placeholder="Search skills…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input w-auto flex-1 min-w-[180px]"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => { setShowNewSkillForm(!showNewSkillForm); setError(''); }}
              className="btn-primary ml-auto"
            >
              + Add to Library
            </button>
          </div>

          {showNewSkillForm && (
            <div className="card p-5 mb-5 border-l-4 border-primary-500">
              <h3 className="section-heading mb-4">New Library Skill</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Skill Name</label>
                  <input type="text" placeholder="e.g. Python" value={newSkillForm.skillName}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, skillName: e.target.value })}
                    className="form-input" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <input type="text" placeholder="e.g. Technology" value={newSkillForm.category}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                    className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" placeholder="Brief description…" value={newSkillForm.detailedDescription}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, detailedDescription: e.target.value })}
                    className="form-input" />
                </div>
              </div>
              <button onClick={handleCreateLibrarySkill} className="btn-success mt-4">Create Skill</button>
            </div>
          )}

          {filteredLibrary.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <div className="text-6xl mb-4" aria-hidden="true">📚</div>
              <p className="text-lg font-medium">No skills found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibrary.map((skill) => (
                <div key={skill._id} className="card card-hover p-4 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{skill.skillName}</h3>
                      <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 mt-1">
                        {skill.category}
                      </span>
                    </div>
                    <button
                      onClick={() => openAddModal(skill)}
                      className="btn-primary flex-shrink-0 py-1.5 px-3 text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  {skill.detailedDescription && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{skill.detailedDescription}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && selectedLibrarySkill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Add skill to profile">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add "{selectedLibrarySkill.skillName}"
              </h2>
              <button onClick={() => setShowAddModal(false)} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="alert-error mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="form-label">Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="form-input">
                  <option value="Offering">Offering (I can teach this)</option>
                  <option value="Wanted">Wanted (I want to learn this)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Proficiency Level</label>
                <select value={addForm.proficiencyLevel} onChange={(e) => setAddForm({ ...addForm, proficiencyLevel: e.target.value })} className="form-input">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="form-label">Experience Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea value={addForm.experienceNotes} onChange={(e) => setAddForm({ ...addForm, experienceNotes: e.target.value })}
                  rows={3} className="form-input resize-none" placeholder="Share your experience…" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleAddSkill} className="btn-primary flex-1">Add to Profile</button>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;

