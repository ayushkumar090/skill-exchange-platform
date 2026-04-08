import React from 'react';

const proficiencyColors = {
  Beginner: 'bg-blue-100 text-blue-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Expert: 'bg-green-100 text-green-800',
};

const statusColors = {
  Offering: 'bg-green-100 text-green-800',
  Wanted: 'bg-purple-100 text-purple-800',
};

const SkillCard = ({ userSkill, onDelete }) => {
  const { skillId, proficiencyLevel, status, experienceNotes } = userSkill;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{skillId?.skillName || 'Unknown Skill'}</h3>
          <p className="text-sm text-gray-500">{skillId?.category || ''}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(userSkill._id)}
            className="text-red-400 hover:text-red-600 transition-colors ml-2 text-lg leading-none"
            title="Remove skill"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${proficiencyColors[proficiencyLevel] || 'bg-gray-100 text-gray-700'}`}>
          {proficiencyLevel}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      </div>
      {experienceNotes && (
        <p className="text-sm text-gray-600 mt-1 italic">"{experienceNotes}"</p>
      )}
    </div>
  );
};

export default SkillCard;
