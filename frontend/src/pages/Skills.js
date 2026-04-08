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

  useEffect(() => {
    fetchUserSkills();
    fetchLibrary();
  }, []);

  useEffect(() => {
    let filtered = library;
    if (search) filtered = filtered.filter((s) => s.skillName.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) filtered = filtered.filter((s) => s.category === categoryFilter);
    setFilteredLibrary(filtered);
  }, [search, categoryFilter, library]);

  const fetchUserSkills = async () => {
    try {
      const res = await api.get('/skills/user');
      setUserSkills(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/skills/library');
      setLibrary(res.data.data);
      setFilteredLibrary(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill from your profile?')) return;
    try {
      await api.delete(`/skills/user/${id}`);
      setUserSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete skill');
    }
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add skill');
    }
  };

  const handleCreateLibrarySkill = async () => {
    if (!newSkillForm.skillName || !newSkillForm.category) {
      setError('Skill name and category are required');
      return;
    }
    try {
      await api.post('/skills/library', newSkillForm);
      setSuccess('Skill added to library!');
      setTimeout(() => setSuccess(''), 3000);
      setShowNewSkillForm(false);
      setNewSkillForm({ skillName: '', category: '', detailedDescription: '' });
      fetchLibrary();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create skill');
    }
  };

  const categories = [...new Set(library.map((s) => s.category))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Skills</h1>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'my' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          My Skills ({userSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Skill Library ({library.length})
        </button>
      </div>

      {activeTab === 'my' && (
        <div>
          {userSkills.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-lg">No skills added yet</p>
              <button onClick={() => setActiveTab('library')} className="mt-3 text-blue-600 hover:underline text-sm">Browse the library to add skills</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((us) => <SkillCard key={us._id} userSkill={us} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => { setShowNewSkillForm(!showNewSkillForm); setError(''); }}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add to Library
            </button>
          </div>

          {showNewSkillForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-5">
              <h3 className="font-semibold text-gray-700 mb-3">New Library Skill</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Skill Name"
                  value={newSkillForm.skillName}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, skillName: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Technology)"
                  value={newSkillForm.category}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newSkillForm.detailedDescription}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, detailedDescription: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:col-span-2"
                />
              </div>
              <button onClick={handleCreateLibrarySkill} className="mt-3 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Create Skill
              </button>
            </div>
          )}

          {filteredLibrary.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📚</div>
              <p>No skills found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibrary.map((skill) => (
                <div key={skill._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{skill.skillName}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{skill.category}</span>
                    </div>
                    <button
                      onClick={() => openAddModal(skill)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap ml-2"
                    >
                      + Add
                    </button>
                  </div>
                  {skill.detailedDescription && <p className="text-sm text-gray-500 mt-2">{skill.detailedDescription}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddModal && selectedLibrarySkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add "{selectedLibrarySkill.skillName}" to Profile</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Offering">Offering (I can teach this)</option>
                  <option value="Wanted">Wanted (I want to learn this)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
                <select
                  value={addForm.proficiencyLevel}
                  onChange={(e) => setAddForm({ ...addForm, proficiencyLevel: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Notes (optional)</label>
                <textarea
                  value={addForm.experienceNotes}
                  onChange={(e) => setAddForm({ ...addForm, experienceNotes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Share your experience with this skill..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddSkill} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Profile
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
