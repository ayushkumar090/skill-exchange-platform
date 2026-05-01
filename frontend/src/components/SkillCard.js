import React from 'react';

const proficiencyConfig = {
  Beginner:     { cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',      dot: 'bg-sky-500' },
  Intermediate: { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', dot: 'bg-amber-500' },
  Expert:       { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

const statusConfig = {
  Offering: { cls: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300' },
  Wanted:   { cls: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300' },
};

const categoryIcons = {
  Technology: '💻', Music: '🎵', Art: '🎨', Language: '🗣️',
  Cooking: '🍳', Sports: '⚽', Writing: '✍️', Science: '🔬',
};

const SkillCard = ({ userSkill, onDelete }) => {
  const { skillId, proficiencyLevel, status, experienceNotes } = userSkill;
  const profConf = proficiencyConfig[proficiencyLevel] || { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' };
  const statConf = statusConfig[status] || { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
  const categoryIcon = categoryIcons[skillId?.category] || '🎯';

  return (
    <div className="card card-hover group flex flex-col gap-3 p-5 cursor-default">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
            {categoryIcon}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {skillId?.skillName || 'Unknown Skill'}
            </h3>
            {skillId?.category && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{skillId.category}</span>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(userSkill._id)}
            aria-label={`Remove ${skillId?.skillName}`}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`badge ${profConf.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${profConf.dot}`} aria-hidden="true"></span>
          {proficiencyLevel}
        </span>
        <span className={`badge ${statConf.cls}`}>{status}</span>
      </div>

      {experienceNotes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-slate-700 pt-2">
          "{experienceNotes}"
        </p>
      )}
    </div>
  );
};

export default SkillCard;

